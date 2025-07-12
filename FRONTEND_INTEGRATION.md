# StackIt Frontend Integration Guide

## 🎯 Overview

Your frontend has been successfully integrated with the simplified backend server! This guide explains how the integration works and how to use it.

## ✅ What's Been Integrated

### 1. API Service Layer (`src/services/api.js`)
- Complete REST API client for all backend endpoints
- Error handling and response parsing
- Type-safe request/response handling

### 2. Data Manager (`src/services/dataManager.js`)
- Smart fallback system: API first, mock data second
- Automatic server availability detection
- Seamless offline mode support

### 3. Updated Components
- **App.jsx**: Now uses API calls with optimistic updates
- **HomePage.jsx**: Integrated search with backend API
- **Vite Config**: Proxy setup for seamless development

## 🚀 How It Works

### Server Detection
```javascript
// Automatically checks if backend is available
const isAvailable = await dataManager.checkServerAvailability();

// If server is up: Use API
// If server is down: Use mock data
```

### Optimistic Updates
```javascript
// UI updates immediately for better UX
setQuestions(prev => [newQuestion, ...prev]);

// Then syncs with server
const savedQuestion = await api.createQuestion(questionData);
```

### Fallback System
```javascript
// Try API first
try {
  return await api.getQuestions();
} catch (error) {
  // Fall back to mock data
  return mockQuestions;
}
```

## 🔌 Available API Endpoints

### Questions
```javascript
// Get all questions
const questions = await api.getQuestions();

// Search questions
const results = await api.searchQuestions("react");

// Create question
const newQuestion = await api.createQuestion({
  title: "How to use React?",
  description: "Need help...",
  tags: ["react"],
  author: "username"
});

// Vote on question
await api.voteOnQuestion(questionId, "up"); // or "down"
```

### Answers
```javascript
// Get answers for a question
const answers = await api.getAnswersForQuestion(questionId);

// Create answer
const newAnswer = await api.createAnswer(questionId, {
  content: "Here's how to do it...",
  author: "username"
});

// Vote on answer
await api.voteOnAnswer(answerId, "up");

// Accept answer
await api.acceptAnswer(answerId);
```

### Notifications
```javascript
// Get all notifications
const notifications = await api.getNotifications();

// Get only unread notifications
const unread = await api.getNotifications(true);

// Get unread count (for badge)
const { count } = await api.getUnreadNotificationCount();

// Mark as read
await api.markNotificationAsRead(notificationId);

// Mark all as read
await api.markAllNotificationsAsRead();
```

## 🎮 How to Run

### Quick Start (Recommended)
```bash
# From stackit root directory
./run-dev.sh
```

This automatically starts:
- Backend server on http://localhost:3001
- Frontend server on http://localhost:5173
- Sets up proxy configuration

### Manual Start
```bash
# Terminal 1: Start backend
cd backend/simple-server
npm install && npm start

# Terminal 2: Start frontend
cd frontend  
npm install && npm run dev
```

## 📊 Data Flow

### 1. Page Load
```
Frontend → dataManager → API/Mock Data → Components
```

### 2. User Action (e.g., Create Question)
```
User Input → Optimistic UI Update → API Call → Server Response → Final UI Update
```

### 3. Search
```
Search Input → Debounced API Call → Results → Updated UI
```

### 4. Notifications
```
Action Triggers → Server Creates Notification → Frontend Fetches → UI Updates
```

## 🎨 UI Features That Work

### ✅ Fully Functional
- **Question browsing** - Real data from API
- **Question creation** - Saves to backend
- **Voting system** - Syncs with server
- **Answer posting** - Creates real answers
- **Answer acceptance** - Updates backend
- **Search functionality** - Backend-powered search
- **Notifications** - Real notification system
- **Tag filtering** - Dynamic tag loading

### ✅ Offline Support
- **Graceful degradation** - Falls back to mock data
- **Visual indicators** - Shows when offline
- **Core functionality** - Still works without server

## 🔧 Development Features

### Hot Reload
- Frontend changes auto-reload
- Backend changes require restart

### Proxy Configuration
```javascript
// vite.config.js
server: {
  proxy: {
    "/api": {
      target: "http://localhost:3001",
      changeOrigin: true,
    },
  },
}
```

### Error Handling
```javascript
// Automatic fallback on API errors
try {
  return await api.getQuestions();
} catch (error) {
  console.warn('API failed, using mock data');
  return mockQuestions;
}
```

## 📱 Server Status Indicator

The app shows server status in the UI:

```jsx
{serverStatus === false && (
  <div className="bg-yellow-50 border-b border-yellow-200">
    <p className="text-yellow-800">
      ⚠️ Server unavailable - running in offline mode
    </p>
  </div>
)}
```

## 🎯 Data Format Compatibility

The backend provides data in **exactly** the format your frontend expects:

### Questions
```json
{
  "id": 1,
  "title": "How to center a div?",
  "description": "I need help...",
  "tags": ["css", "html"],
  "author": "username",
  "createdAt": "2023-10-10T14:30:00Z",
  "votes": 5,
  "answers": 2,
  "views": 100,
  "accepted": false
}
```

### Notifications
```json
{
  "id": 1,
  "type": "answer",
  "message": "Someone answered your question",
  "questionTitle": "How to center a div?",
  "timestamp": "2023-10-11T09:05:00Z",
  "read": false
}
```

## 🔄 Adding New Features

### 1. Add API Endpoint
```javascript
// In api.js
async newFeature(data) {
  return this.request('/new-endpoint', {
    method: 'POST',
    body: data,
  });
}
```

### 2. Add Data Manager Method
```javascript
// In dataManager.js
async newFeature(data) {
  return this.withFallback(
    () => api.newFeature(data),
    mockFallbackData
  );
}
```

### 3. Use in Components
```javascript
// In component
const handleNewFeature = async (data) => {
  const result = await dataManager.newFeature(data);
  // Update UI
};
```

## 🐛 Debugging

### Check Server Status
```bash
curl http://localhost:3001/api/health
```

### View Network Requests
- Open browser dev tools
- Network tab shows all API calls
- Console shows fallback messages

### Common Issues

1. **CORS Errors**: Use the proxy configuration
2. **Port Conflicts**: Change ports in configs
3. **API Failures**: Check console for fallback messages

## 🎉 Success Indicators

### ✅ Integration Working When:
- Questions load from backend (check Network tab)
- Search returns backend results
- New questions save to server
- Notifications appear after actions
- Voting updates vote counts
- No console errors

### ⚠️ Fallback Mode When:
- Yellow warning bar appears
- Console shows "Server unavailable"
- Network tab shows failed requests
- Mock data is used

## 🚀 Next Steps

### For Development
1. **Build UI components** - All data is available
2. **Add features** - Follow the patterns shown
3. **Test offline mode** - Stop backend server
4. **Style components** - Data structure is stable

### For Production
1. **Keep API structure** - Frontend won't need changes
2. **Replace simple server** - With production backend
3. **Add authentication** - Extend current user system
4. **Deploy both services** - Frontend + backend

## 💡 Pro Tips

### Performance
- Data manager includes debouncing for search
- Optimistic updates provide instant feedback
- Fallback system ensures app always works

### UX
- Loading states show during API calls
- Error states handled gracefully
- Offline mode clearly indicated

### Development
- Use the dev script for easy setup
- Check console for integration status
- Network tab shows real vs mock data

## 🏆 Bottom Line

Your frontend now has:
- **Real backend integration** with fallback support
- **All existing functionality** preserved
- **Professional data flow** patterns
- **Production-ready** API architecture

**Your hackathon demo is ready to impress! 🎯**

The frontend works perfectly whether the backend is running or not, giving you maximum flexibility during development and presentations.