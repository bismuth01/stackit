import React, { useState } from 'react';
import axios from 'axios';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import AskQuestionPage from './pages/AskQuestionPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import './Global.css';
import { AnimatePresence, motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // ✅ Added

const BASE_URL = 'http://localhost:8000'; // Auth
const QA_URL = 'http://localhost:3000'; // Questions & Answers

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState('login');

  const handleAuth = async (formData) => {
    try {
      const endpoint = authMode === 'login' ? '/login' : '/register';
      const response = await axios.post(`${BASE_URL}${endpoint}`, formData);

      if (response.data.success) {
        if (authMode === 'login') {
          setUser({ username: formData.username, password: formData.password });
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
    if (action === 'logout') handleLogout();
    else {
      setAuthMode(action);
      setCurrentPage('auth');
    }
  };

  const handleQuestionSubmit = async (questionData) => {
    if (!user || !(user.id || user.username)) return alert("User not logged in");

    const plainText = questionData.description.replace(/<[^>]+>/g, '').trim();
    if (!plainText) return alert("Description can't be empty");
    if (!questionData.title || !questionData.title.trim()) return alert("Title is required");
    if (!questionData.tags || questionData.tags.length === 0) return alert("Please add at least one tag");

    const generatedId = uuidv4(); // ✅ ID generator

    try {
      const response = await axios.post(`${QA_URL}/questions`, {
        questionId: generatedId,
        authorId: user.id || user.username,
        title: questionData.title.trim(),
        body: questionData.description,
        tags: questionData.tags,
      });

      const newQuestion = { ...response.data, id: generatedId, answers: 0, views: 0, votes: 0 };
      setQuestions([newQuestion, ...questions]);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error submitting question:', error);
      alert(error.response?.data?.error || 'Failed to submit question.');
    }
  };

  const handleAnswerSubmit = async (answerData) => {
    try {
      const payload = {
        questionId: answerData.questionId,
        authorId: user.id || user.username,
        body: answerData.content,
      };

      const response = await axios.post(`${QA_URL}/answers`, payload);
      const newAnswer = { ...response.data, questionId: answerData.questionId }; // ✅ Ensure questionId present
      setAnswers([...answers, newAnswer]);

      setQuestions(questions.map(q =>
        q.id === answerData.questionId
          ? { ...q, answers: (q.answers || 0) + 1 }
          : q
      ));

      const question = questions.find(q => q.id === answerData.questionId);
      if (question && question.author !== user.username) {
        setNotifications([
          {
            id: uuidv4(),
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
      alert(err.response?.data?.error || 'Failed to post answer.');
    }
  };

  const handleVote = (id, direction, type) => {
    const increment = direction === 'up' ? 1 : -1;
    if (type === 'question') {
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, votes: (q.votes || 0) + increment } : q
      ));
    } else {
      setAnswers(answers.map(a =>
        a.id === id ? { ...a, votes: (a.votes || 0) + increment } : a
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

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setCurrentPage('question');
    setQuestions(questions.map(q =>
      q.id === question.id ? { ...q, views: (q.views || 0) + 1 } : q
    ));

    try {
      const res = await axios.get(`${QA_URL}/questions/${question.id}/answers`);
      setAnswers(res.data || []);
    } catch (err) {
      console.error('Error loading answers:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    setNotifications(notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));

    const question = questions.find(q => q.title === notification.questionTitle);
    if (question) handleQuestionClick(question);
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
