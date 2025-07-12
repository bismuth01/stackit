// Notification API Example
// This file demonstrates how to use the notification system in your backend services

const { Client } = require('pg');
const redis = require('redis');

class NotificationService {
    constructor(dbConfig, redisConfig) {
        this.dbConfig = dbConfig;
        this.redisConfig = redisConfig;
        this.pgClient = null;
        this.redisClient = null;
    }

    async connect() {
        // Connect to PostgreSQL
        this.pgClient = new Client(this.dbConfig);
        await this.pgClient.connect();

        // Connect to Redis (DB 2 for notifications)
        this.redisClient = redis.createClient({
            ...this.redisConfig,
            db: 2
        });
        await this.redisClient.connect();
    }

    async disconnect() {
        if (this.pgClient) await this.pgClient.end();
        if (this.redisClient) await this.redisClient.quit();
    }

    // Get notifications for a user
    async getUserNotifications(userId, options = {}) {
        const {
            limit = 20,
            offset = 0,
            unreadOnly = false,
            type = null
        } = options;

        let query = `
            SELECT n.id, n.type, n.message, n.is_read, n.created_at,
                   n.question_id, n.answer_id, n.comment_id,
                   q.title as question_title
            FROM notifications n
            LEFT JOIN questions q ON n.question_id = q.id
            WHERE n.user_id = $1
        `;

        const params = [userId];
        let paramIndex = 2;

        if (unreadOnly) {
            query += ` AND n.is_read = false`;
        }

        if (type) {
            query += ` AND n.type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await this.pgClient.query(query, params);
        return result.rows;
    }

    // Get unread notification count
    async getUnreadCount(userId) {
        // Try to get from Redis cache first
        const cacheKey = `user:${userId}:unread_count`;
        const cachedCount = await this.redisClient.get(cacheKey);

        if (cachedCount !== null) {
            return parseInt(cachedCount);
        }

        // Get from database and cache the result
        const result = await this.pgClient.query(
            'SELECT get_unread_notification_count($1) as count',
            [userId]
        );

        const count = result.rows[0].count;

        // Cache for 5 minutes
        await this.redisClient.setEx(cacheKey, 300, count.toString());

        return count;
    }

    // Mark notifications as read
    async markAsRead(userId, notificationIds = null) {
        const result = await this.pgClient.query(
            'SELECT mark_notifications_read($1, $2) as updated_count',
            [userId, notificationIds]
        );

        const updatedCount = result.rows[0].updated_count;

        // Clear cached unread count
        await this.redisClient.del(`user:${userId}:unread_count`);

        // Emit real-time update
        await this.emitRealtimeUpdate(userId, {
            type: 'notifications_read',
            count: updatedCount,
            notification_ids: notificationIds
        });

        return updatedCount;
    }

    // Create mention notification
    async createMentionNotification(mentionedUserId, mentionerUserId, questionId, answerId = null, commentId = null, context = 'comment') {
        const result = await this.pgClient.query(
            'SELECT create_mention_notification($1, $2, $3, $4, $5, $6) as notification_id',
            [mentionedUserId, mentionerUserId, questionId, answerId, commentId, context]
        );

        const notificationId = result.rows[0].notification_id;

        if (notificationId) {
            // Clear cached unread count
            await this.redisClient.del(`user:${mentionedUserId}:unread_count`);

            // Emit real-time notification
            const notification = await this.getNotificationById(notificationId);
            await this.emitRealtimeUpdate(mentionedUserId, {
                type: 'new_notification',
                notification: notification
            });
        }

        return notificationId;
    }

    // Get single notification by ID
    async getNotificationById(notificationId) {
        const result = await this.pgClient.query(`
            SELECT n.id, n.type, n.message, n.is_read, n.created_at,
                   n.user_id, n.actor_user_id, n.question_id, n.answer_id, n.comment_id,
                   q.title as question_title
            FROM notifications n
            LEFT JOIN questions q ON n.question_id = q.id
            WHERE n.id = $1
        `, [notificationId]);

        return result.rows[0] || null;
    }

    // Update user notification preferences
    async updateUserPreferences(userId, preferences) {
        const {
            answer_notifications = true,
            comment_notifications = true,
            mention_notifications = true,
            vote_notifications = true
        } = preferences;

        const result = await this.pgClient.query(`
            INSERT INTO user_notification_preferences
            (user_id, answer_notifications, comment_notifications, mention_notifications, vote_notifications, updated_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id)
            DO UPDATE SET
                answer_notifications = $2,
                comment_notifications = $3,
                mention_notifications = $4,
                vote_notifications = $5,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [userId, answer_notifications, comment_notifications, mention_notifications, vote_notifications]);

        return result.rows[0];
    }

    // Get user notification preferences
    async getUserPreferences(userId) {
        const result = await this.pgClient.query(
            'SELECT * FROM user_notification_preferences WHERE user_id = $1',
            [userId]
        );

        // Return default preferences if none exist
        if (result.rows.length === 0) {
            return {
                user_id: userId,
                answer_notifications: true,
                comment_notifications: true,
                mention_notifications: true,
                vote_notifications: true
            };
        }

        return result.rows[0];
    }

    // Emit real-time update via Redis pub/sub
    async emitRealtimeUpdate(userId, data) {
        const channel = `notifications:user:${userId}`;
        await this.redisClient.publish(channel, JSON.stringify({
            timestamp: new Date().toISOString(),
            ...data
        }));
    }

    // Clean up old read notifications
    async cleanupOldNotifications(daysToKeep = 30) {
        const result = await this.pgClient.query(
            'SELECT cleanup_old_notifications($1) as deleted_count',
            [daysToKeep]
        );

        return result.rows[0].deleted_count;
    }

    // Get notification statistics
    async getNotificationStats(userId) {
        const result = await this.pgClient.query(`
            SELECT
                COUNT(*) as total_notifications,
                COUNT(*) FILTER (WHERE is_read = false) as unread_count,
                COUNT(*) FILTER (WHERE type = 'answer') as answer_count,
                COUNT(*) FILTER (WHERE type = 'comment') as comment_count,
                COUNT(*) FILTER (WHERE type = 'mention') as mention_count,
                COUNT(*) FILTER (WHERE type = 'vote') as vote_count,
                MAX(created_at) as latest_notification
            FROM notifications
            WHERE user_id = $1
        `, [userId]);

        return result.rows[0];
    }
}

// Express.js API Routes Example
function createNotificationRoutes(notificationService) {
    const express = require('express');
    const router = express.Router();

    // Middleware to check authentication (implement based on your auth system)
    const requireAuth = (req, res, next) => {
        // Implement your authentication check here
        // For example, verify JWT token and set req.userId
        if (!req.userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        next();
    };

    // GET /notifications - Get user notifications
    router.get('/notifications', requireAuth, async (req, res) => {
        try {
            const { limit, offset, unread_only, type } = req.query;

            const notifications = await notificationService.getUserNotifications(req.userId, {
                limit: parseInt(limit) || 20,
                offset: parseInt(offset) || 0,
                unreadOnly: unread_only === 'true',
                type: type || null
            });

            res.json({
                notifications,
                pagination: {
                    limit: parseInt(limit) || 20,
                    offset: parseInt(offset) || 0
                }
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    });

    // GET /notifications/count - Get unread notification count
    router.get('/notifications/count', requireAuth, async (req, res) => {
        try {
            const count = await notificationService.getUnreadCount(req.userId);
            res.json({ unread_count: count });
        } catch (error) {
            console.error('Error fetching notification count:', error);
            res.status(500).json({ error: 'Failed to fetch notification count' });
        }
    });

    // PUT /notifications/read - Mark notifications as read
    router.put('/notifications/read', requireAuth, async (req, res) => {
        try {
            const { notification_ids } = req.body;

            const updatedCount = await notificationService.markAsRead(
                req.userId,
                notification_ids || null
            );

            res.json({
                success: true,
                updated_count: updatedCount
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            res.status(500).json({ error: 'Failed to mark notifications as read' });
        }
    });

    // GET /notifications/preferences - Get user notification preferences
    router.get('/notifications/preferences', requireAuth, async (req, res) => {
        try {
            const preferences = await notificationService.getUserPreferences(req.userId);
            res.json(preferences);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            res.status(500).json({ error: 'Failed to fetch preferences' });
        }
    });

    // PUT /notifications/preferences - Update user notification preferences
    router.put('/notifications/preferences', requireAuth, async (req, res) => {
        try {
            const preferences = await notificationService.updateUserPreferences(
                req.userId,
                req.body
            );
            res.json(preferences);
        } catch (error) {
            console.error('Error updating preferences:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    });

    // POST /notifications/mention - Create mention notification
    router.post('/notifications/mention', requireAuth, async (req, res) => {
        try {
            const { mentioned_user_id, question_id, answer_id, comment_id, context } = req.body;

            const notificationId = await notificationService.createMentionNotification(
                mentioned_user_id,
                req.userId,
                question_id,
                answer_id,
                comment_id,
                context
            );

            if (notificationId) {
                res.json({
                    success: true,
                    notification_id: notificationId
                });
            } else {
                res.json({
                    success: false,
                    message: 'Notification not created (user preferences disabled)'
                });
            }
        } catch (error) {
            console.error('Error creating mention notification:', error);
            res.status(500).json({ error: 'Failed to create mention notification' });
        }
    });

    // GET /notifications/stats - Get notification statistics
    router.get('/notifications/stats', requireAuth, async (req, res) => {
        try {
            const stats = await notificationService.getNotificationStats(req.userId);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching notification stats:', error);
            res.status(500).json({ error: 'Failed to fetch notification stats' });
        }
    });

    return router;
}

// WebSocket real-time updates example
function setupRealtimeNotifications(io, redisClient) {
    // Subscribe to notification channels
    const subscriber = redisClient.duplicate();

    io.on('connection', (socket) => {
        // When user connects, subscribe them to their notification channel
        socket.on('subscribe_notifications', (userId) => {
            const channel = `notifications:user:${userId}`;

            // Join socket room for this user
            socket.join(`user:${userId}`);

            // Subscribe to Redis channel
            subscriber.subscribe(channel, (message) => {
                const data = JSON.parse(message);

                // Emit to all sockets for this user
                io.to(`user:${userId}`).emit('notification_update', data);
            });
        });

        socket.on('disconnect', () => {
            // Clean up subscriptions if needed
        });
    });
}

// Usage example
async function main() {
    const dbConfig = {
        host: 'localhost',
        port: 5432,
        user: 'stackit_user',
        password: 'stackit_password',
        database: 'stackit_content'
    };

    const redisConfig = {
        host: 'localhost',
        port: 6379
    };

    const notificationService = new NotificationService(dbConfig, redisConfig);
    await notificationService.connect();

    // Example: Get notifications for a user
    const notifications = await notificationService.getUserNotifications(
        '11111111-1111-1111-1111-111111111111',
        { limit: 10, unreadOnly: true }
    );

    console.log('User notifications:', notifications);

    await notificationService.disconnect();
}

module.exports = {
    NotificationService,
    createNotificationRoutes,
    setupRealtimeNotifications
};
