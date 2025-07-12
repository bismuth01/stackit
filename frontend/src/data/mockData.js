// mockData.js

export const mockQuestions = [
  {
    id: 1,
    title: 'How to center a div in CSS?',
    description: 'I have been trying to center a div both vertically and horizontally in CSS. What are the best methods to achieve this?',
    tags: ['css', 'html', 'frontend'],
    author: 'frontendMaster',
    createdAt: '2023-10-10T10:00:00Z',
    votes: 5,
    answers: 2,
    views: 100,
    accepted: true,
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
    accepted: false,
  }
];

export const mockAnswers = [
  {
    id: 1,
    questionId: 1,
    content: 'You can use flexbox like this: `display: flex; justify-content: center; align-items: center;` on the parent element.',
    author: 'cssWizard',
    createdAt: '2023-10-11T09:00:00Z',
    votes: 3,
    accepted: true
  },
  {
    id: 2,
    questionId: 1,
    content: 'Another method is using grid: `display: grid; place-items: center;`.',
    author: 'gridGenius',
    createdAt: '2023-10-11T10:15:00Z',
    votes: 1,
    accepted: false
  },
  {
    id: 3,
    questionId: 2,
    content: '`var` is function-scoped, while `let` and `const` are block-scoped. `const` is used for variables that won’t be reassigned.',
    author: 'jsNinja',
    createdAt: '2023-11-06T08:45:00Z',
    votes: 4,
    accepted: false
  }
];

export const mockNotifications = [
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
    message: 'Someone upvoted your answer',
    questionTitle: 'What is the difference between let, const, and var in JavaScript?',
    timestamp: '2023-11-06T09:00:00Z',
    read: true
  }
];
