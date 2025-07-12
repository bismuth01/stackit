import React, { useState } from 'react';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import "./Global.css";
import { mockQuestions, mockAnswers, mockNotifications } from './data/mockData';
import { AnimatePresence, motion } from 'framer-motion'; // 👈 added

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
      setAuthMode(action);
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

    setQuestions(questions.map(q =>
      q.id === answerData.questionId ? { ...q, answers: q.answers + 1 } : q
    ));

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

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setCurrentPage('question');
    setQuestions(questions.map(q =>
      q.id === question.id ? { ...q, views: q.views + 1 } : q
    ));
  };

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
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage
                questions={questions}
                onQuestionClick={handleQuestionClick}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </motion.div>
          )}

          {currentPage === 'ask' && user && (
            <motion.div
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AskQuestionPage
                onQuestionSubmit={handleQuestionSubmit}
                onCancel={() => setCurrentPage('home')}
              />
            </motion.div>
          )}

          {currentPage === 'question' && selectedQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionDetailPage
                question={selectedQuestion}
                answers={currentPageAnswers}
                onBackToHome={() => setCurrentPage('home')}
                onAnswerSubmit={handleAnswerSubmit}
                onVote={handleVote}
                onAcceptAnswer={handleAcceptAnswer}
                user={user}
              />
            </motion.div>
          )}

          {currentPage === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AuthPage
                mode={authMode}
                onAuth={handleAuth}
                onToggleMode={() =>
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
