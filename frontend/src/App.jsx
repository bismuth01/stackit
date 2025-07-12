import React, { useState } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import './Global.css';
import { AnimatePresence, motion } from 'framer-motion';

// Backend URLs
const BASE_URL = 'http://localhost:5000'; // Auth
const QA_URL = 'http://localhost:5001'; // Questions & Answers

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState('login');

  // AUTH
  const handleAuth = async (formData) => {
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`${BASE_URL}${endpoint}`, formData);

      if (response.data.success) {
        if (authMode === 'login') {
          setUser({
            username: response.data.user.username,
            email: response.data.user.email,
            id: response.data.user.id || response.data.user._id,
          });
          setCurrentPage('home');
        } else {
          alert('Registration successful. Please login.');
          setAuthMode('login');
          setCurrentPage('auth');
        }
      } else {
        alert(response.data.message || 'Authentication failed.');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      alert(error.response?.data?.message || 'Something went wrong.');
    }
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

  // SUBMIT QUESTION
  const handleQuestionSubmit = async (questionData) => {
    try {
      const response = await axios.post(`${QA_URL}/questions`, {
        authorId: user.id || user.username,
        title: questionData.title,
        body: questionData.description,
        tags: questionData.tags,
      });

      const newQuestion = response.data;
      setQuestions([newQuestion, ...questions]);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question.');
    }
  };

  // SUBMIT ANSWER
  const handleAnswerSubmit = async (answerData) => {
    try {
      const response = await axios.post(`${QA_URL}/answers`, {
        questionId: answerData.questionId,
        authorId: user.id || user.username,
        body: answerData.content,
      });

      const newAnswer = response.data;
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
            read: false,
          },
          ...notifications,
        ]);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to post answer.');
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
    <div className="min-h-screen bg-[#1e1a2e] text-[#b3a8c9] font-sans">
      <Navigation
        user={user}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onAuthAction={handleAuthAction}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <HomePage
                questions={questions}
                onQuestionClick={handleQuestionClick}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </motion.div>
          )}

          {currentPage === 'ask' && user && (
            <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AskQuestionPage
                onQuestionSubmit={handleQuestionSubmit}
                onCancel={() => setCurrentPage('home')}
              />
            </motion.div>
          )}

          {currentPage === 'question' && selectedQuestion && (
            <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
