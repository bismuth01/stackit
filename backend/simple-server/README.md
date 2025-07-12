# StackIt Simple Server

A simplified backend server for the StackIt Q&A platform that provides mock data in the exact format your frontend developer needs.

## 🎯 Problem Solved

Your original implementation was too complex with:
- PostgreSQL with UUID primary keys
- Multiple databases (users, content, notifications)
- Redis caching layers
- Docker containers
- Complex database triggers and functions

Your frontend developer needs simple data structures with integer IDs and straightforward field names. This simplified server provides exactly that!

## 📊 Data Structures Provided

### Notification Format
```json
{
  "id": 1,
  "type": "answer",
  "message": "cssWizard answered your question",
  "questionTitle": "How to center a div in CSS?",
  "timestamp": "2023-10-11T09:05:00Z",
  "read": false
}
```

### Answer Format
```json
{
  "id": 3,
  "questionId": 2,
  "content": "`var` is function-scoped, while `let` and `const` are block-scoped...",
  "author": "jsNinja",
  "createdAt": "2023-11-06T08:45:00Z",
  "votes": 4,
  "accepted": false
}
```

### Question Format
```json
{
  "id": 2,
  "title": "What is the difference between let, const, and var in JavaScript?",
  "description": "Can someone explain the difference between let, const, and var with examples?",
  "tags": ["javascript", "es6"],
  "author": "devGuru",
  "createdAt": "2023-11-05T14:30:00Z",
  "votes": 10,
  "answers": 3,
  "views": 250,
  "accepted": false
}
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd stackit/backend/simple-server
npm install
```

### 2. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Test Everything Works
```bash
npm test
```

The server will run on `http://localhost:3001`

## 📚 API Endpoints

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question (increments view count)
- `POST /api/questions` - Create new question
- `POST /api/questions/:id/vote` - Vote on question (up/down)
- `GET /api/questions/:id/answers` - Get answers for a question

### Answers
- `POST /api/questions/:id/answers` - Create new answer
- `POST /api/answers/:id/vote` - Vote on answer (up/down)
- `POST /api/answers/:id/accept` - Accept an answer

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications?unreadOnly=true` - Get only unread notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `GET /api/notifications/unread-count` - Get count of unread notifications

### Other
- `GET /api/tags` - Get all tags with usage counts
- `GET /api/search?q=searchterm` - Search questions
- `GET /api/health` - Health check endpoint

## 🔧 Example Usage

### Get Questions
```bash
curl http://localhost:3001/api/questions
```

### Create a Question
```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to use React hooks?",
    "description": "I need help understanding React hooks",
    "tags": ["react", "hooks"],
    "author": "reactNewbie"
  }'
```

### Get Notifications
```bash
curl http://localhost:3001/api/notifications
```

### Get Unread Count
```bash
curl http://localhost:3001/api/notifications/unread-count
```

## 🎮 Frontend Integration

Your frontend can now use simple fetch calls:

```javascript
// Get questions
const questions = await fetch('/api/questions').then(r => r.json());

// Get notifications
const notifications = await fetch('/api/notifications').then(r => r.json());

// Get unread count for badge
const { count } = await fetch('/api/notifications/unread-count').then(r => r.json());

// Create new question
const newQuestion = await fetch('/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Question',
    description: 'Question details...',
    tags: ['tag1', 'tag2'],
    author: 'username'
  })
}).then(r => r.json());
```

## 🎯 Features Implemented

### Core Q&A Features
- ✅ Questions with voting, views, and answer counts
- ✅ Answers with voting and acceptance
- ✅ Tag system with usage tracking
- ✅ Search functionality
- ✅ Automatic question statistics updates

### Notification System
- ✅ Answer notifications (when someone answers your question)
- ✅ Vote notifications (when someone upvotes your content)
- ✅ Comment notifications (simulated)
- ✅ Read/unread status tracking
- ✅ Unread count for UI badges

### Data Management
- ✅ In-memory storage (perfect for development)
- ✅ Auto-incrementing integer IDs (no UUIDs!)
- ✅ Simple field names (no complex foreign keys)
- ✅ Automatic relationship management

## 🔄 How It Differs from Complex Version

| Complex Version | Simple Version |
|----------------|----------------|
| PostgreSQL + Redis | In-memory storage |
| UUID primary keys | Integer IDs |
| Multiple databases | Single data structure |
| Docker containers | Just Node.js |
| Database triggers | Simple JavaScript logic |
| Complex schemas | Plain objects |

## 📈 Benefits for Your Team

### For Frontend Developer
- ✅ Exact data format they requested
- ✅ No database knowledge needed
- ✅ Simple integer IDs to work with
- ✅ Immediate feedback and testing
- ✅ No Docker/database setup required

### For Backend Team
- ✅ Quick to modify and extend
- ✅ Easy to debug and troubleshoot
- ✅ No complex infrastructure
- ✅ Can prototype features quickly
- ✅ Can migrate to complex version later

### For Project Timeline
- ✅ Frontend can start immediately
- ✅ No time spent on database complexity
- ✅ Rapid iteration and testing
- ✅ Parallel development possible

## 🛠 Development Tips

### Adding New Features
1. Add data to the in-memory arrays at the top of `server.js`
2. Create new endpoints following the existing pattern
3. Test with `npm test` or manual curl commands

### Modifying Data Structures
1. Update the mock data objects
2. Update the API responses
3. Test that frontend still works

### Extending Notifications
1. Add new notification types to the `notifications` array
2. Create notifications in relevant endpoints
3. Update the notification filtering if needed

## 🔮 Migration Path

When ready to move to production:

1. **Keep the API structure** - Your frontend won't need to change
2. **Replace in-memory storage** with a real database
3. **Add authentication** and user management
4. **Implement real-time features** with WebSockets
5. **Add data persistence** and backup strategies

The simple server acts as a perfect API contract that your complex implementation can follow later.

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

This will:
- ✅ Test all API endpoints
- ✅ Validate data structures match your requirements
- ✅ Verify notification system works
- ✅ Check voting and acceptance features
- ✅ Confirm search functionality

## 🎉 Success!

Your frontend developer can now work with exactly the data format they need, while your backend team can focus on the core features without getting bogged down in database complexity.

**Start the server and let your frontend developer build the UI!**

```bash
npm start
# Server running on http://localhost:3001
# API docs at http://localhost:3001
```
