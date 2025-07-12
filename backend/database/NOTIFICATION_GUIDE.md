# StackIt Notification System Guide

A comprehensive guide to the in-app notification system for StackIt platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Database Schema](#database-schema)
- [API Usage](#api-usage)
- [Real-time Updates](#real-time-updates)
- [Frontend Integration](#frontend-integration)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The StackIt notification system provides real-time, in-app notifications for user interactions. It supports four main notification types:

- **Answer**: When someone answers your question
- **Comment**: When someone comments on your content
- **Mention**: When someone mentions you in content
- **Vote**: When someone upvotes your content

### Key Features

✅ **Automatic Notifications**: Triggered by database events  
✅ **User Preferences**: Granular control over notification types  
✅ **Real-time Updates**: Via Redis pub/sub and WebSockets  
✅ **Performance Optimized**: Redis caching for unread counts  
✅ **Clean Database Design**: Minimal, focused schema  

## 🚀 Quick Start

### 1. Setup Database

```bash
# Run the automated setup (includes notifications)
./database/scripts/setup-databases.sh

# Or setup notifications separately
psql -U stackit_user -d stackit_content -f database/scripts/setup-notifications-db.sql
```

### 2. Test the System

```bash
# Test database connections and notification system
node database/scripts/test-notifications.js
```

### 3. Use in Your Service

```javascript
const { NotificationService } = require('../shared/notification-api-example');

const notificationService = new NotificationService(dbConfig, redisConfig);
await notificationService.connect();

// Get user notifications
const notifications = await notificationService.getUserNotifications(userId);
console.log(notifications);
```

## 📊 Database Schema

### Core Tables

#### `notifications`
```sql
id              UUID PRIMARY KEY
user_id         UUID NOT NULL           -- Recipient
type            VARCHAR(20)             -- 'answer', 'comment', 'mention', 'vote'
message         TEXT NOT NULL           -- Pre-formatted message
actor_user_id   UUID NOT NULL           -- Who performed the action
question_id     UUID                    -- Context reference
answer_id       UUID                    -- Context reference
comment_id      UUID                    -- Context reference
is_read         BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```

#### `user_notification_preferences`
```sql
user_id                UUID PRIMARY KEY
answer_notifications   BOOLEAN DEFAULT TRUE
comment_notifications  BOOLEAN DEFAULT TRUE
mention_notifications  BOOLEAN DEFAULT TRUE
vote_notifications     BOOLEAN DEFAULT TRUE
created_at            TIMESTAMP DEFAULT NOW()
updated_at            TIMESTAMP DEFAULT NOW()
```

### Automatic Triggers

The system automatically creates notifications when:

1. **New Answer**: `answers` table INSERT triggers `notify_question_answered()`
2. **New Comment**: `comments` table INSERT triggers `notify_content_commented()`
3. **New Upvote**: `votes` table INSERT triggers `notify_content_voted()`

### Helper Functions

- `get_unread_notification_count(user_id)`: Get unread count
- `mark_notifications_read(user_id, notification_ids[])`: Mark as read
- `create_mention_notification(...)`: Create mention notification
- `cleanup_old_notifications(days)`: Remove old read notifications

## 📡 API Usage

### Basic Operations

#### Get User Notifications
```javascript
// Get recent notifications
const notifications = await notificationService.getUserNotifications(userId, {
    limit: 20,
    offset: 0,
    unreadOnly: false,
    type: null  // or 'answer', 'comment', 'mention', 'vote'
});
```

#### Get Unread Count
```javascript
// Cached in Redis for performance
const count = await notificationService.getUnreadCount(userId);
```

#### Mark as Read
```javascript
// Mark specific notifications
await notificationService.markAsRead(userId, [notificationId1, notificationId2]);

// Mark all as read
await notificationService.markAsRead(userId);
```

### User Preferences

#### Get Preferences
```javascript
const preferences = await notificationService.getUserPreferences(userId);
// Returns: { answer_notifications: true, comment_notifications: true, ... }
```

#### Update Preferences
```javascript
await notificationService.updateUserPreferences(userId, {
    answer_notifications: true,
    comment_notifications: false,
    mention_notifications: true,
    vote_notifications: true
});
```

### Mention Notifications

```javascript
// Create mention notification (called from your content parsing logic)
const notificationId = await notificationService.createMentionNotification(
    mentionedUserId,     // Who was mentioned
    mentionerUserId,     // Who mentioned them
    questionId,          // Question context
    answerId,            // Answer context (optional)
    commentId,           // Comment context (optional)
    'comment'            // Context type
);
```

## 🔄 Real-time Updates

### Redis Integration

The system uses Redis DB 2 for real-time features:

```javascript
// Cache unread counts
user:{userId}:unread_count

// Real-time update channels
notifications:user:{userId}
```

### WebSocket Integration

```javascript
// Setup real-time notifications
const { setupRealtimeNotifications } = require('../shared/notification-api-example');

// In your Socket.IO setup
setupRealtimeNotifications(io, redisClient);

// Client subscribes to notifications
socket.emit('subscribe_notifications', userId);

// Client receives updates
socket.on('notification_update', (data) => {
    if (data.type === 'new_notification') {
        // Show new notification
        displayNotification(data.notification);
    } else if (data.type === 'notifications_read') {
        // Update UI read state
        updateNotificationCount();
    }
});
```

## 🎨 Frontend Integration

### React Example

```jsx
import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';

function NotificationBell({ userId }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const socket = useSocket();

    useEffect(() => {
        // Load initial data
        fetchUnreadCount();
        fetchNotifications();

        // Subscribe to real-time updates
        socket.emit('subscribe_notifications', userId);
        socket.on('notification_update', handleNotificationUpdate);

        return () => {
            socket.off('notification_update', handleNotificationUpdate);
        };
    }, [userId]);

    const fetchUnreadCount = async () => {
        const response = await fetch('/api/notifications/count');
        const data = await response.json();
        setUnreadCount(data.unread_count);
    };

    const fetchNotifications = async () => {
        const response = await fetch('/api/notifications?limit=10');
        const data = await response.json();
        setNotifications(data.notifications);
    };

    const handleNotificationUpdate = (data) => {
        if (data.type === 'new_notification') {
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        } else if (data.type === 'notifications_read') {
            setUnreadCount(prev => Math.max(0, prev - data.count));
            // Update read status in notifications list
            setNotifications(prev => 
                prev.map(n => 
                    data.notification_ids?.includes(n.id) 
                        ? { ...n, is_read: true }
                        : n
                )
            );
        }
    };

    const markAsRead = async (notificationIds = null) => {
        await fetch('/api/notifications/read', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_ids: notificationIds })
        });
    };

    return (
        <div className="notification-bell">
            <button onClick={() => setShowDropdown(!showDropdown)}>
                🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            
            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="header">
                        <h3>Notifications</h3>
                        <button onClick={() => markAsRead()}>Mark all read</button>
                    </div>
                    
                    <div className="notification-list">
                        {notifications.map(notification => (
                            <div 
                                key={notification.id}
                                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                                onClick={() => markAsRead([notification.id])}
                            >
                                <div className="message">{notification.message}</div>
                                <div className="time">{formatTime(notification.created_at)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
```

### Express.js Routes

```javascript
const express = require('express');
const { createNotificationRoutes } = require('../shared/notification-api-example');

const app = express();
const notificationService = new NotificationService(dbConfig, redisConfig);

// Add notification routes
app.use('/api', createNotificationRoutes(notificationService));

// Routes available:
// GET /api/notifications
// GET /api/notifications/count
// PUT /api/notifications/read
// GET /api/notifications/preferences
// PUT /api/notifications/preferences
// POST /api/notifications/mention
// GET /api/notifications/stats
```

## ⚡ Advanced Features

### Mention Detection

```javascript
// Parse content for mentions (implement in your content service)
function parseMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]); // username
    }
    
    return mentions;
}

// When saving comment/answer with mentions
const mentions = parseMentions(commentContent);
for (const username of mentions) {
    const mentionedUser = await getUserByUsername(username);
    if (mentionedUser) {
        await notificationService.createMentionNotification(
            mentionedUser.id,
            currentUserId,
            questionId,
            answerId,
            commentId,
            'comment'
        );
    }
}
```

### Notification Aggregation

```javascript
// Group similar notifications (implement as needed)
function groupNotifications(notifications) {
    const grouped = {};
    
    notifications.forEach(notification => {
        const key = `${notification.type}_${notification.question_id}`;
        
        if (!grouped[key]) {
            grouped[key] = {
                ...notification,
                count: 1,
                actors: [notification.actor_user_id]
            };
        } else {
            grouped[key].count++;
            if (!grouped[key].actors.includes(notification.actor_user_id)) {
                grouped[key].actors.push(notification.actor_user_id);
            }
        }
    });
    
    return Object.values(grouped);
}
```

### Cleanup Jobs

```javascript
// Run periodically (e.g., daily cron job)
async function cleanupNotifications() {
    const deletedCount = await notificationService.cleanupOldNotifications(30);
    console.log(`Cleaned up ${deletedCount} old notifications`);
}
```

### Performance Monitoring

```javascript
// Get notification statistics
const stats = await notificationService.getNotificationStats(userId);
console.log({
    total: stats.total_notifications,
    unread: stats.unread_count,
    breakdown: {
        answers: stats.answer_count,
        comments: stats.comment_count,
        mentions: stats.mention_count,
        votes: stats.vote_count
    }
});
```

## 🔍 Troubleshooting

### Common Issues

#### No Notifications Being Created

1. **Check triggers are installed**:
   ```sql
   SELECT trigger_name, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_name LIKE '%notify%';
   ```

2. **Check user preferences**:
   ```sql
   SELECT * FROM user_notification_preferences WHERE user_id = 'your-user-id';
   ```

3. **Verify test data**:
   ```bash
   node database/scripts/test-notifications.js
   ```

#### Real-time Updates Not Working

1. **Check Redis connection**:
   ```bash
   redis-cli -n 2 ping
   ```

2. **Verify WebSocket connection**:
   ```javascript
   socket.on('connect', () => console.log('Connected to notifications'));
   socket.on('disconnect', () => console.log('Disconnected from notifications'));
   ```

3. **Test Redis pub/sub**:
   ```bash
   # Terminal 1
   redis-cli -n 2 SUBSCRIBE "notifications:user:test-user-id"
   
   # Terminal 2
   redis-cli -n 2 PUBLISH "notifications:user:test-user-id" '{"test": "message"}'
   ```

#### Performance Issues

1. **Check notification table size**:
   ```sql
   SELECT 
       pg_size_pretty(pg_total_relation_size('notifications')) as size,
       COUNT(*) as row_count
   FROM notifications;
   ```

2. **Monitor unread counts**:
   ```sql
   SELECT 
       user_id,
       COUNT(*) FILTER (WHERE is_read = false) as unread_count
   FROM notifications 
   GROUP BY user_id 
   ORDER BY unread_count DESC;
   ```

3. **Run cleanup if needed**:
   ```sql
   SELECT cleanup_old_notifications(30);
   ```

### Debugging Queries

```sql
-- Check recent notifications
SELECT n.*, q.title as question_title
FROM notifications n
LEFT JOIN questions q ON n.question_id = q.id
ORDER BY n.created_at DESC
LIMIT 10;

-- Check notification counts by type
SELECT type, COUNT(*) as count
FROM notifications
GROUP BY type;

-- Check user preferences
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE answer_notifications = false) as answer_disabled,
    COUNT(*) FILTER (WHERE comment_notifications = false) as comment_disabled
FROM user_notification_preferences;

-- Find users with many unread notifications
SELECT 
    user_id,
    COUNT(*) as unread_count
FROM notifications
WHERE is_read = false
GROUP BY user_id
ORDER BY unread_count DESC;
```

## 📚 API Reference

### NotificationService Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getUserNotifications(userId, options)` | Get user notifications | `userId, {limit, offset, unreadOnly, type}` | `Array<Notification>` |
| `getUnreadCount(userId)` | Get unread count (cached) | `userId` | `Number` |
| `markAsRead(userId, notificationIds)` | Mark notifications as read | `userId, Array<UUID>?` | `Number` |
| `createMentionNotification(...)` | Create mention notification | Multiple parameters | `UUID?` |
| `getUserPreferences(userId)` | Get user preferences | `userId` | `Object` |
| `updateUserPreferences(userId, prefs)` | Update preferences | `userId, Object` | `Object` |
| `getNotificationStats(userId)` | Get notification statistics | `userId` | `Object` |
| `cleanupOldNotifications(days)` | Clean old notifications | `Number` | `Number` |

### Database Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `get_unread_notification_count(UUID)` | Get unread count | `user_id` | `INTEGER` |
| `mark_notifications_read(UUID, UUID[])` | Mark as read | `user_id, notification_ids[]` | `INTEGER` |
| `create_mention_notification(...)` | Create mention | Multiple | `UUID` |
| `cleanup_old_notifications(INTEGER)` | Cleanup old | `days_to_keep` | `INTEGER` |

## 🤝 Contributing

When extending the notification system:

1. **Add new notification types**: Update the CHECK constraint in the `notifications` table
2. **New triggers**: Follow the existing pattern in `setup-notifications-db.sql`
3. **Update tests**: Add test cases to `test-notifications.js`
4. **Document changes**: Update this guide and the main README

## 📞 Support

If you encounter issues:

1. Run the test script: `node database/scripts/test-notifications.js`
2. Check the [Troubleshooting](#troubleshooting) section
3. Review database logs for trigger errors
4. Verify Redis connectivity and configuration

---

**Happy coding with notifications! 🔔**