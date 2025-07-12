# StackIt Quick Start Guide

## 🚨 URGENT: Your hackathon is saved!

Your complex database implementation was too much for the timeline. This simplified solution gets your frontend developer working **TODAY** with the exact data format they need.

## ⚡ 2-Minute Setup

```bash
# 1. Go to the simple server
cd stackit/backend/simple-server

# 2. Install and start (one command)
npm install && npm start
```

**Done!** Server running on `http://localhost:3001`

## 🎯 What Your Frontend Gets

### Exact Mock Data Format

**Notifications:**
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

**Answers:**
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

**Questions:**
```json
{
  "id": 2,
  "title": "What is the difference between let, const, and var in JavaScript?",
  "description": "Can someone explain the difference...",
  "tags": ["javascript", "es6"],
  "author": "devGuru",
  "createdAt": "2023-11-05T14:30:00Z", 
  "votes": 10,
  "answers": 3,
  "views": 250,
  "accepted": false
}
```

## 🔌 Frontend Usage (Copy & Paste Ready)

```javascript
// Get questions for homepage
const questions = await fetch('/api/questions').then(r => r.json());

// Get notifications for dropdown  
const notifications = await fetch('/api/notifications').then(r => r.json());

// Get unread count for badge
const { count } = await fetch('/api/notifications/unread-count').then(r => r.json());

// Create new question
const newQuestion = await fetch('/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'How to use React?',
    description: 'Need help...',
    tags: ['react'],
    author: 'username'
  })
}).then(r => r.json());

// Vote on question
await fetch('/api/questions/1/vote', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'up' })
});
```

## 📚 All API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/questions` | GET | Get all questions |
| `/api/questions/:id` | GET | Get single question |
| `/api/questions` | POST | Create question |
| `/api/questions/:id/vote` | POST | Vote on question |
| `/api/questions/:id/answers` | GET | Get answers |
| `/api/questions/:id/answers` | POST | Create answer |
| `/api/answers/:id/vote` | POST | Vote on answer |
| `/api/answers/:id/accept` | POST | Accept answer |
| `/api/notifications` | GET | Get notifications |
| `/api/notifications/unread-count` | GET | Get unread count |
| `/api/notifications/:id/read` | PUT | Mark as read |
| `/api/tags` | GET | Get all tags |
| `/api/search?q=term` | GET | Search questions |

## ✅ What Works Right Now

- ✅ **Questions** - Create, view, vote, search
- ✅ **Answers** - Create, vote, accept  
- ✅ **Notifications** - Auto-generated when actions happen
- ✅ **Tags** - Auto-tracked with usage counts
- ✅ **Voting** - Upvote/downvote on questions and answers
- ✅ **Search** - Find questions by title, description, tags
- ✅ **Statistics** - Answer counts, view counts, vote counts

## 🎮 Test It Works

```bash
# In the simple-server directory
npm test
```

Or test manually:
```bash
curl http://localhost:3001/api/questions
curl http://localhost:3001/api/notifications  
curl http://localhost:3001/api/notifications/unread-count
```

## 💡 Key Benefits

### For Frontend Developer
- ✅ **Start building today** - No waiting for complex backend
- ✅ **Exact data format** - Matches their mock data perfectly
- ✅ **Simple integers** - No UUIDs or complex IDs
- ✅ **Full functionality** - All core features work

### For Project Timeline  
- ✅ **Demo ready** - Working prototype immediately
- ✅ **Parallel development** - Frontend and backend work separately
- ✅ **Risk reduction** - Something working vs nothing working
- ✅ **Stakeholder confidence** - Show real functionality

## 🚀 Migration Strategy

This isn't throwaway code! When ready:

1. **Keep same API endpoints** - Frontend won't change
2. **Swap storage layer** - Replace in-memory with database  
3. **Add authentication** - User sessions and security
4. **Add real-time** - WebSockets for live updates
5. **Production features** - Logging, monitoring, etc.

## 🏆 Bottom Line

**Your frontend developer can build the entire UI today** while you figure out the complex backend later.

This is classic "build the right thing first" vs "build the thing right first" - you're delivering value immediately while reducing technical risk.

## 📞 Need Help?

- **Start server:** `cd stackit/backend/simple-server && npm start`
- **Test endpoints:** `npm test`  
- **See sample data:** `node sample-data.js`
- **Check status:** `curl http://localhost:3001/api/health`

**Your hackathon just became deliverable! 🎉**