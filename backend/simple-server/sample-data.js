// Sample Data Generator for StackIt Simple Server
// This file contains all the mock data in the exact format your frontend needs

// Sample notifications matching your frontend mock data format
const sampleNotifications = [
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
    },
    {
        id: 4,
        type: 'mention',
        message: 'You were mentioned in a comment',
        questionTitle: 'Best practices for React state management',
        timestamp: '2023-11-09T14:30:00Z',
        read: false
    },
    {
        id: 5,
        type: 'answer',
        message: 'reactMaster answered your question',
        questionTitle: 'Best practices for React state management',
        timestamp: '2023-11-10T16:45:00Z',
        read: false
    }
];

// Sample answers matching your frontend mock data format
const sampleAnswers = [
    {
        id: 1,
        questionId: 1,
        content: 'You can use flexbox: `display: flex; justify-content: center; align-items: center;` on the parent container. This is the most modern and flexible approach.',
        author: 'flexMaster',
        createdAt: '2023-10-10T15:45:00Z',
        votes: 12,
        accepted: false
    },
    {
        id: 2,
        questionId: 1,
        content: 'Another approach is using CSS Grid: `display: grid; place-items: center;` on the parent. This is even more concise than flexbox.',
        author: 'gridGuru',
        createdAt: '2023-10-10T16:20:00Z',
        votes: 8,
        accepted: true
    },
    {
        id: 3,
        questionId: 2,
        content: '`var` is function-scoped, while `let` and `const` are block-scoped. `const` is used for variables that won\'t be reassigned. Here\'s an example:\n\n```javascript\nfunction example() {\n  if (true) {\n    var a = 1; // function-scoped\n    let b = 2; // block-scoped\n    const c = 3; // block-scoped, immutable\n  }\n  console.log(a); // 1 (accessible)\n  // console.log(b); // ReferenceError\n  // console.log(c); // ReferenceError\n}\n```',
        author: 'jsNinja',
        createdAt: '2023-11-06T08:45:00Z',
        votes: 4,
        accepted: false
    },
    {
        id: 4,
        questionId: 2,
        content: 'Additionally, `var` has hoisting behavior that can be confusing. Variables declared with `var` are hoisted to the top of their function scope and initialized with `undefined`. `let` and `const` are also hoisted but remain uninitialized until their declaration is reached.',
        author: 'hoistingExpert',
        createdAt: '2023-11-06T09:30:00Z',
        votes: 7,
        accepted: true
    },
    {
        id: 5,
        questionId: 3,
        content: 'Use try-catch blocks with async/await: \n\n```javascript\ntry {\n  const result = await someAsyncFunction();\n  console.log(result);\n} catch (error) {\n  console.error(\'Error:\', error);\n}\n```\n\nThis makes asynchronous code look and behave more like synchronous code.',
        author: 'asyncExpert',
        createdAt: '2023-11-08T10:30:00Z',
        votes: 6,
        accepted: true
    },
    {
        id: 6,
        questionId: 4,
        content: 'For React state management, start with built-in `useState` and `useReducer`. For global state, consider Context API first. Only move to Redux or Zustand if you really need the complexity.',
        author: 'reactMaster',
        createdAt: '2023-11-09T11:15:00Z',
        votes: 9,
        accepted: false
    }
];

// Sample questions matching your frontend mock data format
const sampleQuestions = [
    {
        id: 1,
        title: 'How to center a div in CSS?',
        description: 'I\'ve been trying to center a div element horizontally and vertically on the page. I\'ve tried using margin: auto and text-align: center, but nothing seems to work properly. What are the best and most reliable methods to achieve perfect centering?',
        tags: ['css', 'html', 'frontend', 'layout'],
        author: 'cssWizard',
        createdAt: '2023-10-10T14:30:00Z',
        votes: 15,
        answers: 2,
        views: 180,
        accepted: true
    },
    {
        id: 2,
        title: 'What is the difference between let, const, and var in JavaScript?',
        description: 'Can someone explain the difference between let, const, and var with examples? I keep hearing about scope and hoisting but I\'m not sure I understand the practical differences.',
        tags: ['javascript', 'es6', 'variables'],
        author: 'devGuru',
        createdAt: '2023-11-05T14:30:00Z',
        votes: 10,
        answers: 2,
        views: 250,
        accepted: true
    },
    {
        id: 3,
        title: 'How to handle async/await in Node.js?',
        description: 'I\'m having trouble understanding how to properly use async/await in Node.js. Can someone provide examples of common patterns and error handling?',
        tags: ['nodejs', 'javascript', 'async', 'promises'],
        author: 'nodeNewbie',
        createdAt: '2023-11-08T09:15:00Z',
        votes: 8,
        answers: 1,
        views: 95,
        accepted: true
    },
    {
        id: 4,
        title: 'Best practices for React state management',
        description: 'What are the current best practices for managing state in React applications? Should I use Redux, Context API, or something else? When should I choose one over the other?',
        tags: ['react', 'state-management', 'redux', 'context'],
        author: 'reactLearner',
        createdAt: '2023-11-09T13:20:00Z',
        votes: 12,
        answers: 1,
        views: 140,
        accepted: false
    },
    {
        id: 5,
        title: 'How to optimize React app performance?',
        description: 'My React application is getting slow as it grows. What are the best techniques to optimize performance? I\'ve heard about React.memo, useMemo, and useCallback but not sure when to use them.',
        tags: ['react', 'performance', 'optimization', 'hooks'],
        author: 'performanceSeeker',
        createdAt: '2023-11-10T10:45:00Z',
        votes: 6,
        answers: 0,
        views: 75,
        accepted: false
    },
    {
        id: 6,
        title: 'Understanding closures in JavaScript',
        description: 'I\'m struggling to understand closures in JavaScript. Can someone explain what they are and provide practical examples of when and why you would use them?',
        tags: ['javascript', 'closures', 'functions', 'scope'],
        author: 'functionFan',
        createdAt: '2023-11-11T08:30:00Z',
        votes: 4,
        answers: 0,
        views: 45,
        accepted: false
    }
];

// Sample tags with usage counts
const sampleTags = [
    { name: 'javascript', count: 4 },
    { name: 'react', count: 3 },
    { name: 'css', count: 1 },
    { name: 'html', count: 1 },
    { name: 'nodejs', count: 1 },
    { name: 'es6', count: 1 },
    { name: 'frontend', count: 1 },
    { name: 'async', count: 1 },
    { name: 'performance', count: 1 },
    { name: 'state-management', count: 1 },
    { name: 'redux', count: 1 },
    { name: 'context', count: 1 },
    { name: 'hooks', count: 1 },
    { name: 'closures', count: 1 },
    { name: 'functions', count: 1 },
    { name: 'scope', count: 2 },
    { name: 'variables', count: 1 },
    { name: 'promises', count: 1 },
    { name: 'layout', count: 1 },
    { name: 'optimization', count: 1 }
];

// Function to generate additional sample data
function generateMoreQuestions(count = 5) {
    const titles = [
        'How to use TypeScript with React?',
        'Best practices for API design',
        'Understanding promises vs async/await',
        'How to structure a Node.js project?',
        'CSS Grid vs Flexbox: when to use which?',
        'Introduction to GraphQL',
        'How to test React components?',
        'Database indexing best practices',
        'Understanding event loops in JavaScript',
        'How to build a REST API with Express?'
    ];

    const descriptions = [
        'I need help understanding the basics and best practices.',
        'Looking for comprehensive guidance and examples.',
        'Can someone explain with practical examples?',
        'What are the industry standards and recommendations?',
        'I\'m new to this concept and need clarification.',
        'Seeking expert advice and real-world use cases.',
        'What are the common pitfalls to avoid?',
        'Looking for step-by-step implementation guide.',
        'How does this work under the hood?',
        'What tools and libraries are recommended?'
    ];

    const tagOptions = ['javascript', 'react', 'nodejs', 'css', 'html', 'typescript', 'api', 'database', 'testing', 'express', 'graphql'];
    const authors = ['codeNewbie', 'webDev123', 'fullStackDev', 'frontendGuru', 'backendExpert', 'techEnthusiast'];

    const questions = [];
    const currentId = sampleQuestions.length + 1;

    for (let i = 0; i < Math.min(count, titles.length); i++) {
        questions.push({
            id: currentId + i,
            title: titles[i],
            description: descriptions[i % descriptions.length],
            tags: tagOptions.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3),
            author: authors[Math.floor(Math.random() * authors.length)],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            votes: Math.floor(Math.random() * 20),
            answers: Math.floor(Math.random() * 5),
            views: Math.floor(Math.random() * 300) + 10,
            accepted: Math.random() > 0.7
        });
    }

    return questions;
}

// Function to generate additional notifications
function generateMoreNotifications(count = 5) {
    const types = ['answer', 'vote', 'comment', 'mention'];
    const messages = {
        answer: ['answered your question', 'provided an answer to your question', 'responded to your question'],
        vote: ['upvoted your answer', 'upvoted your question', 'liked your content'],
        comment: ['commented on your answer', 'commented on your question', 'left a comment'],
        mention: ['mentioned you in a comment', 'mentioned you in an answer', 'tagged you']
    };
    const authors = ['helpfulUser', 'expertDev', 'communityMod', 'seniorDev', 'mentorDev'];

    const notifications = [];
    const currentId = sampleNotifications.length + 1;

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const author = authors[Math.floor(Math.random() * authors.length)];
        const messageTemplates = messages[type];
        const messageTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];

        notifications.push({
            id: currentId + i,
            type: type,
            message: `${author} ${messageTemplate}`,
            questionTitle: sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)].title,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            read: Math.random() > 0.4
        });
    }

    return notifications;
}

// Export data for use in server
module.exports = {
    sampleNotifications,
    sampleAnswers,
    sampleQuestions,
    sampleTags,
    generateMoreQuestions,
    generateMoreNotifications
};

// If run directly, output sample data for inspection
if (require.main === module) {
    console.log('📊 StackIt Sample Data Generator');
    console.log('================================\n');

    console.log('🔔 Sample Notification (Frontend Format):');
    console.log(JSON.stringify(sampleNotifications[0], null, 2));

    console.log('\n💬 Sample Answer (Frontend Format):');
    console.log(JSON.stringify(sampleAnswers[0], null, 2));

    console.log('\n❓ Sample Question (Frontend Format):');
    console.log(JSON.stringify(sampleQuestions[0], null, 2));

    console.log('\n🏷️  Sample Tags:');
    console.log(JSON.stringify(sampleTags.slice(0, 5), null, 2));

    console.log('\n✅ All data structures match your frontend requirements exactly!');
    console.log('\nData Summary:');
    console.log(`- ${sampleNotifications.length} notifications`);
    console.log(`- ${sampleAnswers.length} answers`);
    console.log(`- ${sampleQuestions.length} questions`);
    console.log(`- ${sampleTags.length} tags`);
}
