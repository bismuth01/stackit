import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation.jsx";
import HomePage from "./pages/HomePage.jsx";
import AskQuestionPage from "./pages/AskQuestionPage.jsx";
import QuestionDetailPage from "./pages/QuestionDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import "./Global.css";
import { mockQuestions, mockAnswers, mockNotifications } from "./data/mockData";
import { AnimatePresence, motion } from "framer-motion"; // 👈 added
import dataManager from "./services/dataManager.js";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Check server status and load data
        const [questionsData, notificationsData] = await Promise.all([
          dataManager.getQuestions(),
          dataManager.getNotifications(),
        ]);

        setQuestions(questionsData || []);
        setNotifications(notificationsData || []);
        setServerStatus(dataManager.getServerStatus());
      } catch (error) {
        console.error("Failed to load initial data:", error);
        // Fallback to mock data
        setQuestions(mockQuestions);
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load answers when a question is selected
  useEffect(() => {
    if (selectedQuestion) {
      const loadAnswers = async () => {
        try {
          const answersData = await dataManager.getAnswersForQuestion(
            selectedQuestion.id,
          );
          setAnswers(answersData || []);
        } catch (error) {
          console.error("Failed to load answers:", error);
          setAnswers(
            mockAnswers.filter((a) => a.questionId === selectedQuestion.id),
          );
        }
      };
      loadAnswers();
    }
  }, [selectedQuestion]);

  // AUTH
  const handleAuth = (formData) => {
    setUser({ username: formData.username, email: formData.email });
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("home");
  };

  const handleAuthAction = (action) => {
    if (action === "logout") {
      handleLogout();
    } else {
      setAuthMode(action);
      setCurrentPage("auth");
    }
  };

  // QUESTION SUBMISSION
  const handleQuestionSubmit = async (questionData) => {
    try {
      const newQuestion = await dataManager.createQuestion({
        ...questionData,
        author: user.username,
      });

      // Update local state optimistically
      setQuestions((prev) => [newQuestion, ...prev]);
      setCurrentPage("home");
    } catch (error) {
      console.error("Failed to create question:", error);
      // Fallback to local creation
      const newQuestion = {
        id: Date.now(),
        ...questionData,
        author: user.username,
        createdAt: new Date().toISOString(),
        votes: 0,
        answers: 0,
        views: 0,
        accepted: false,
      };
      setQuestions((prev) => [newQuestion, ...prev]);
      setCurrentPage("home");
    }
  };

  // ANSWER SUBMISSION
  const handleAnswerSubmit = async (answerData) => {
    try {
      const newAnswer = await dataManager.createAnswer(answerData.questionId, {
        content: answerData.content,
        author: user.username,
      });

      // Update local state optimistically
      setAnswers((prev) => [...prev, newAnswer]);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === answerData.questionId ? { ...q, answers: q.answers + 1 } : q,
        ),
      );

      // Refresh notifications to get any new ones from the server
      try {
        const updatedNotifications = await dataManager.getNotifications();
        setNotifications(updatedNotifications || notifications);
      } catch (error) {
        // Fallback to local notification creation
        const question = questions.find((q) => q.id === answerData.questionId);
        if (question && question.author !== user.username) {
          setNotifications((prev) => [
            {
              id: Date.now(),
              type: "answer",
              message: `${user.username} answered your question`,
              questionTitle: question.title,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...prev,
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to create answer:", error);
      // Fallback to local creation
      const newAnswer = {
        id: Date.now(),
        ...answerData,
        author: user.username,
        createdAt: new Date().toISOString(),
        votes: 0,
        accepted: false,
      };
      setAnswers((prev) => [...prev, newAnswer]);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === answerData.questionId ? { ...q, answers: q.answers + 1 } : q,
        ),
      );
    }
  };

  const handleVote = async (id, direction, type) => {
    const increment = direction === "up" ? 1 : -1;

    // Update UI optimistically
    if (type === "question") {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, votes: q.votes + increment } : q,
        ),
      );
    } else {
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, votes: a.votes + increment } : a,
        ),
      );
    }

    // Send to server
    try {
      if (type === "question") {
        await dataManager.voteOnQuestion(id, direction);
      } else {
        await dataManager.voteOnAnswer(id, direction);
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      // Revert optimistic update on error
      if (type === "question") {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === id ? { ...q, votes: q.votes - increment } : q,
          ),
        );
      } else {
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, votes: a.votes - increment } : a,
          ),
        );
      }
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    // Update UI optimistically
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId
          ? { ...a, accepted: true }
          : a.questionId === selectedQuestion.id
            ? { ...a, accepted: false }
            : a,
      ),
    );
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === selectedQuestion.id ? { ...q, accepted: true } : q,
      ),
    );

    // Send to server
    try {
      await dataManager.acceptAnswer(answerId);
    } catch (error) {
      console.error("Failed to accept answer:", error);
      // Keep the optimistic update since it's just UI state
    }
  };

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setCurrentPage("question");

    // Update view count optimistically
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === question.id ? { ...q, views: q.views + 1 } : q,
      ),
    );

    // Get fresh question data from server (which will increment views)
    try {
      const updatedQuestion = await dataManager.getQuestion(question.id);
      if (updatedQuestion) {
        setSelectedQuestion(updatedQuestion);
        setQuestions((prev) =>
          prev.map((q) => (q.id === question.id ? updatedQuestion : q)),
        );
      }
    } catch (error) {
      console.error("Failed to update question views:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Update UI optimistically
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );

    // Mark as read on server
    try {
      await dataManager.markNotificationAsRead(notification.id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    const question = questions.find(
      (q) => q.title === notification.questionTitle,
    );
    if (question) {
      handleQuestionClick(question);
    }
  };

  const currentPageAnswers = selectedQuestion
    ? answers.filter((a) => a.questionId === selectedQuestion.id)
    : [];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading StackIt...</p>
          {serverStatus === false && (
            <p className="text-sm text-yellow-600 mt-2">
              Server unavailable - using offline mode
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Server status indicator */}
      {serverStatus === false && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-yellow-800">
              ⚠️ Server unavailable - running in offline mode with limited
              functionality
            </p>
          </div>
        </div>
      )}

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
          {currentPage === "home" && (
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

          {currentPage === "ask" && user && (
            <motion.div
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AskQuestionPage
                onQuestionSubmit={handleQuestionSubmit}
                onCancel={() => setCurrentPage("home")}
              />
            </motion.div>
          )}

          {currentPage === "question" && selectedQuestion && (
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
                onBackToHome={() => setCurrentPage("home")}
                onAnswerSubmit={handleAnswerSubmit}
                onVote={handleVote}
                onAcceptAnswer={handleAcceptAnswer}
                user={user}
              />
            </motion.div>
          )}

          {currentPage === "auth" && (
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
                  setAuthMode(authMode === "login" ? "register" : "login")
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
