import React, { useState } from 'react';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import "./Global.css"
import { mockQuestions, mockAnswers, mockNotifications } from './data/mockData';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState(mockQuestions);
  const [answers, setAnswers] = useState(mockAnswers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState('login');

  // AUTH
  const handleAuth = (formData) => {
    // TEMP: Replace this with actual JWT call in future
    setUser({ username: formData.username, email: formData.email });
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const handleAuthAction = (action) => {
    if (action === 'logout') {
      handleLogout();
    } else {
      setAuthMode(action); // 'login' or 'register'
      setCurrentPage('auth');
    }
  };

  // QUESTION SUBMISSION
  const handleQuestionSubmit = (questionData) => {
    const newQuestion = {
      id: questions.length + 1,
      ...questionData,
      author: user.username,
      createdAt: new Date().toISOString(),
      votes: 0,
      answers: 0,
      views: 0,
      accepted: false,
    };
    setQuestions([newQuestion, ...questions]);
    setCurrentPage('home');
  };

  // ANSWER SUBMISSION
  const handleAnswerSubmit = (answerData) => {
    const newAnswer = {
      id: answers.length + 1,
      ...answerData,
      author: user.username,
      createdAt: new Date().toISOString(),
      votes: 0,
      accepted: false,
    };
    setAnswers([...answers, newAnswer]);

    // Update answer count in the question
    setQuestions(questions.map(q =>
      q.id === answerData.questionId ? { ...q, answers: q.answers + 1 } : q
    ));

    // Add notification
    const question = questions.find(q => q.id === answerData.questionId);
    if (question && question.author !== user.username) {
      setNotifications([
        {
          id: notifications.length + 1,
          type: 'answer',
          message: `${user.username} answered your question`,
          questionTitle: question.title,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...notifications
      ]);
    }
  };

  // VOTING
  const handleVote = (id, direction, type) => {
    const increment = direction === 'up' ? 1 : -1;

    if (type === 'question') {
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, votes: q.votes + increment } : q
      ));
    } else {
      setAnswers(answers.map(a =>
        a.id === id ? { ...a, votes: a.votes + increment } : a
      ));
    }
  };

  // ACCEPT ANSWER
  const handleAcceptAnswer = (answerId) => {
    setAnswers(answers.map(a =>
      a.id === answerId
        ? { ...a, accepted: true }
        : a.questionId === selectedQuestion.id
        ? { ...a, accepted: false }
        : a
    ));
    setQuestions(questions.map(q =>
      q.id === selectedQuestion.id ? { ...q, accepted: true } : q
    ));
  };

  // SELECT QUESTION
  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setCurrentPage('question');

    // Increment views
    setQuestions(questions.map(q =>
      q.id === question.id ? { ...q, views: q.views + 1 } : q
    ));
  };

  // NOTIFICATION CLICK
  const handleNotificationClick = (notification) => {
    setNotifications(notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));

    const question = questions.find(q => q.title === notification.questionTitle);
    if (question) {
      handleQuestionClick(question);
    }
  };

  const currentPageAnswers = selectedQuestion
    ? answers.filter(a => a.questionId === selectedQuestion.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={user}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onAuthAction={handleAuthAction}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main>
        {currentPage === 'home' && (
          <HomePage
            questions={questions}
            onQuestionClick={handleQuestionClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentPage === 'ask' && user && (
          <AskQuestionPage
            onQuestionSubmit={handleQuestionSubmit}
            onCancel={() => setCurrentPage('home')}
          />
        )}

        {currentPage === 'question' && selectedQuestion && (
          <QuestionDetailPage
            question={selectedQuestion}
            answers={currentPageAnswers}
            onBackToHome={() => setCurrentPage('home')}
            onAnswerSubmit={handleAnswerSubmit}
            onVote={handleVote}
            onAcceptAnswer={handleAcceptAnswer}
            user={user}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            mode={authMode}
            onAuth={handleAuth}
            onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
