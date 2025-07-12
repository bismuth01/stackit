const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage (simplified mock data)
let questions = [
    {
        id: 1,
        title: 'How to center a div in CSS?',
        description: 'I\'ve been trying to center a div element horizontally and vertically on the page. What are the best methods to achieve this?',
        tags: ['css', 'html', 'frontend'],
        author: 'cssWizard',
        createdAt: '2023-10-10T14:30:00Z',
        votes: 15,
        answers: 2,
        views: 180,
        accepted: false
    },
    {
        id: 2,
        title: 'What is the difference between let, const, and var in JavaScript?',
        description: 'Can someone explain the difference between let, const, and var with examples?',
        tags: ['javascript', 'es6'],
        author: 'devGuru',
        createdAt: '2023-11-05T14:30:00Z',
        votes: 10,
        answers: 3,
        views: 250,
        accepted: false
    },
    {
        id: 3,
        title: 'How to handle async/await in Node.js?',
        description: 'I\'m having trouble understanding how to properly use async/await in Node.js. Can someone provide examples?',
        tags: ['nodejs', 'javascript', 'async'],
        author: 'nodeNewbie',
        createdAt: '2023-11-08T09:15:00Z',
        votes: 8,
        answers: 1,
        views: 95,
        accepted: true
    }
];

let answers = [
    {
        id: 1,
        questionId: 1,
        content: 'You can use flexbox: `display: flex; justify-content: center; align-items: center;` on the parent container.',
        author: 'flexMaster',
        createdAt: '2023-10-10T15:45:00Z',
        votes: 12,
        accepted: false
    },
    {
        id: 2,
        questionId: 1,
        content: 'Another approach is using CSS Grid: `display: grid; place-items: center;` on the parent.',
        author: 'gridGuru',
        createdAt: '2023-10-10T16:20:00Z',
        votes: 8,
        accepted: false
    },
    {
        id: 3,
        questionId: 2,
        content: '`var` is function-scoped, while `let` and `const` are block-scoped. `const` is used for variables that won\'t be reassigned.',
        author: 'jsNinja',
        createdAt: '2023-11-06T08:45:00Z',
        votes: 4,
        accepted: false
    },
    {
        id: 4,
        questionId: 3,
        content: 'Use try-catch blocks with async/await: `try { const result = await someAsyncFunction(); } catch (error) { console.error(error); }`',
        author: 'asyncExpert',
        createdAt: '2023-11-08T10:30:00Z',
        votes: 6,
        accepted: true
    }
];

let notifications = [
    {
        id: 1,
        type: 'answer',
        message: 'cssWizard answered your question',
        questionTitle: 'How to center a div in CSS?',
        timestamp: '2023-10-11T09:05:00Z',
        read: false
    },
    {
        id: 2,
        type: 'vote',
        message: 'Your answer received an upvote',
        questionTitle: 'What is the difference between let, const, and var in JavaScript?',
        timestamp: '2023-11-06T10:15:00Z',
        read: false
    },
    {
        id: 3,
        type: 'comment',
        message: 'Someone commented on your answer',
        questionTitle: 'How to handle async/await in Node.js?',
        timestamp: '2023-11-08T11:20:00Z',
        read: true
    }
];

// Auto-increment counters
let nextQuestionId = 4;
let nextAnswerId = 5;
let nextNotificationId = 4;

// Helper function to update question stats
function updateQuestionStats(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.answers = answers.filter(a => a.questionId === questionId).length;
        question.accepted = answers.some(a => a.questionId === questionId && a.accepted);
    }
}

// API Routes

// Get all questions
app.get('/api/questions', (req, res) => {
    const { tag, sort = 'newest' } = req.query;

    let filteredQuestions = questions;

    // Filter by tag if provided
    if (tag) {
        filteredQuestions = questions.filter(q =>
            q.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
    }

    // Sort questions
    switch (sort) {
        case 'votes':
            filteredQuestions.sort((a, b) => b.votes - a.votes);
            break;
        case 'answers':
            filteredQuestions.sort((a, b) => b.answers - a.answers);
            break;
        case 'views':
            filteredQuestions.sort((a, b) => b.views - a.views);
            break;
        case 'newest':
        default:
            filteredQuestions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    res.json(filteredQuestions);
});

// Get single question
app.get('/api/questions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const question = questions.find(q => q.id === id);

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    // Increment view count
    question.views++;

    res.json(question);
});

// Create new question
app.post('/api/questions', (req, res) => {
    const { title, description, tags, author } = req.body;

    if (!title || !description || !author) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newQuestion = {
        id: nextQuestionId++,
        title,
        description,
        tags: tags || [],
        author,
        createdAt: new Date().toISOString(),
        votes: 0,
        answers: 0,
        views: 0,
        accepted: false
    };

    questions.push(newQuestion);
    res.status(201).json(newQuestion);
});

// Vote on question
app.post('/api/questions/:id/vote', (req, res) => {
    const id = parseInt(req.params.id);
    const { type } = req.body; // 'up' or 'down'

    const question = questions.find(q => q.id === id);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    if (type === 'up') {
        question.votes++;
    } else if (type === 'down') {
        question.votes--;
    }

    res.json({ votes: question.votes });
});

// Get answers for a question
app.get('/api/questions/:id/answers', (req, res) => {
    const questionId = parseInt(req.params.id);
    const questionAnswers = answers.filter(a => a.questionId === questionId);

    // Sort by votes (highest first), then by creation date
    questionAnswers.sort((a, b) => {
        if (b.votes !== a.votes) {
            return b.votes - a.votes;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(questionAnswers);
});

// Create new answer
app.post('/api/questions/:id/answers', (req, res) => {
    const questionId = parseInt(req.params.id);
    const { content, author } = req.body;

    if (!content || !author) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    const newAnswer = {
        id: nextAnswerId++,
        questionId,
        content,
        author,
        createdAt: new Date().toISOString(),
        votes: 0,
        accepted: false
    };

    answers.push(newAnswer);
    updateQuestionStats(questionId);

    // Create notification for question author
    if (question.author !== author) {
        const notification = {
            id: nextNotificationId++,
            type: 'answer',
            message: `${author} answered your question`,
            questionTitle: question.title,
            timestamp: new Date().toISOString(),
            read: false
        };
        notifications.push(notification);
    }

    res.status(201).json(newAnswer);
});

// Vote on answer
app.post('/api/answers/:id/vote', (req, res) => {
    const id = parseInt(req.params.id);
    const { type } = req.body; // 'up' or 'down'

    const answer = answers.find(a => a.id === id);
    if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
    }

    if (type === 'up') {
        answer.votes++;
    } else if (type === 'down') {
        answer.votes--;
    }

    res.json({ votes: answer.votes });
});

// Accept answer
app.post('/api/answers/:id/accept', (req, res) => {
    const id = parseInt(req.params.id);
    const answer = answers.find(a => a.id === id);

    if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
    }

    // Unaccept other answers for the same question
    answers.forEach(a => {
        if (a.questionId === answer.questionId) {
            a.accepted = false;
        }
    });

    // Accept this answer
    answer.accepted = true;
    updateQuestionStats(answer.questionId);

    res.json({ accepted: true });
});

// Get notifications
app.get('/api/notifications', (req, res) => {
    const { unreadOnly } = req.query;

    let filteredNotifications = notifications;

    if (unreadOnly === 'true') {
        filteredNotifications = notifications.filter(n => !n.read);
    }

    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(filteredNotifications);
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
    const id = parseInt(req.params.id);
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    res.json({ read: true });
});

// Mark all notifications as read
app.put('/api/notifications/mark-all-read', (req, res) => {
    notifications.forEach(n => n.read = true);
    res.json({ message: 'All notifications marked as read' });
});

// Get unread notification count
app.get('/api/notifications/unread-count', (req, res) => {
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ count: unreadCount });
});

// Get all tags
app.get('/api/tags', (req, res) => {
    const tagCounts = {};
    questions.forEach(q => {
        q.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const tags = Object.entries(tagCounts).map(([name, count]) => ({
        name,
        count
    })).sort((a, b) => b.count - a.count);

    res.json(tags);
});

// Search questions
app.get('/api/search', (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    const searchTerm = q.toLowerCase();
    const results = questions.filter(question =>
        question.title.toLowerCase().includes(searchTerm) ||
        question.description.toLowerCase().includes(searchTerm) ||
        question.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    res.json(results);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        data: {
            questions: questions.length,
            answers: answers.length,
            notifications: notifications.length
        }
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'StackIt Simple Server API',
        version: '1.0.0',
        endpoints: {
            questions: '/api/questions',
            answers: '/api/questions/:id/answers',
            notifications: '/api/notifications',
            tags: '/api/tags',
            search: '/api/search',
            health: '/api/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 StackIt Simple Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
    console.log(`🔍 Sample endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/questions`);
    console.log(`   GET  http://localhost:${PORT}/api/notifications`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
});

module.exports = app;
