// Data Manager for StackIt Frontend
// Handles API integration with fallback to mock data

import { api } from './api.js';
import { mockQuestions, mockAnswers, mockNotifications } from '../data/mockData.js';

class DataManager {
  constructor() {
    this.isServerAvailable = null;
    this.checkingServer = false;
  }

  // Check if server is available
  async checkServerAvailability() {
    if (this.checkingServer) return this.isServerAvailable;

    this.checkingServer = true;

    try {
      await api.getHealth();
      this.isServerAvailable = true;
      console.log('✅ Backend server is available');
    } catch (error) {
      this.isServerAvailable = false;
      console.log('⚠️ Backend server unavailable, using mock data');
    }

    this.checkingServer = false;
    return this.isServerAvailable;
  }

  // Generic method to try API first, fallback to mock data
  async withFallback(apiCall, fallbackData) {
    if (this.isServerAvailable === null) {
      await this.checkServerAvailability();
    }

    if (this.isServerAvailable) {
      try {
        return await apiCall();
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        this.isServerAvailable = false;
        return fallbackData;
      }
    }

    return fallbackData;
  }

  // Questions
  async getQuestions(params = {}) {
    return this.withFallback(
      () => api.getQuestions(params),
      mockQuestions
    );
  }

  async getQuestion(id) {
    return this.withFallback(
      () => api.getQuestion(id),
      mockQuestions.find(q => q.id === parseInt(id))
    );
  }

  async createQuestion(questionData) {
    if (await this.checkServerAvailability()) {
      try {
        return await api.createQuestion(questionData);
      } catch (error) {
        console.warn('Failed to create question via API:', error);
        // Return mock response for consistency
        return {
          id: Date.now(),
          ...questionData,
          createdAt: new Date().toISOString(),
          votes: 0,
          answers: 0,
          views: 0,
          accepted: false,
        };
      }
    }

    // Mock response when server unavailable
    return {
      id: Date.now(),
      ...questionData,
      createdAt: new Date().toISOString(),
      votes: 0,
      answers: 0,
      views: 0,
      accepted: false,
    };
  }

  async voteOnQuestion(questionId, voteType) {
    if (await this.checkServerAvailability()) {
      try {
        return await api.voteOnQuestion(questionId, voteType);
      } catch (error) {
        console.warn('Failed to vote via API:', error);
        return { votes: 0 }; // Mock response
      }
    }
    return { votes: 0 }; // Mock response
  }

  async searchQuestions(query) {
    return this.withFallback(
      () => api.searchQuestions(query),
      mockQuestions.filter(q =>
        q.title.toLowerCase().includes(query.toLowerCase()) ||
        q.description.toLowerCase().includes(query.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    );
  }

  // Answers
  async getAnswersForQuestion(questionId) {
    return this.withFallback(
      () => api.getAnswersForQuestion(questionId),
      mockAnswers.filter(a => a.questionId === parseInt(questionId))
    );
  }

  async createAnswer(questionId, answerData) {
    if (await this.checkServerAvailability()) {
      try {
        return await api.createAnswer(questionId, answerData);
      } catch (error) {
        console.warn('Failed to create answer via API:', error);
        return {
          id: Date.now(),
          questionId: parseInt(questionId),
          ...answerData,
          createdAt: new Date().toISOString(),
          votes: 0,
          accepted: false,
        };
      }
    }

    return {
      id: Date.now(),
      questionId: parseInt(questionId),
      ...answerData,
      createdAt: new Date().toISOString(),
      votes: 0,
      accepted: false,
    };
  }

  async voteOnAnswer(answerId, voteType) {
    if (await this.checkServerAvailability()) {
      try {
        return await api.voteOnAnswer(answerId, voteType);
      } catch (error) {
        console.warn('Failed to vote on answer via API:', error);
        return { votes: 0 };
      }
    }
    return { votes: 0 };
  }

  async acceptAnswer(answerId) {
    if (await this.checkServerAvailability()) {
      try {
        return await api.acceptAnswer(answerId);
      } catch (error) {
        console.warn('Failed to accept answer via API:', error);
        return { accepted: true };
      }
    }
    return { accepted: true };
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    return this.withFallback(
      () => api.getNotifications(unreadOnly),
      unreadOnly
        ? mockNotifications.filter(n => !n.read)
        : mockNotifications
    );
  }

  async getUnreadNotificationCount() {
    return this.withFallback(
      () => api.getUnreadNotificationCount(),
      { count: mockNotifications.filter(n => !n.read).length }
    );
  }

  async markNotificationAsRead(notificationId) {
    if (await this.checkServerAvailability()) {
      try {
        return await api.markNotificationAsRead(notificationId);
      } catch (error) {
        console.warn('Failed to mark notification as read via API:', error);
        return { read: true };
      }
    }
    return { read: true };
  }

  async markAllNotificationsAsRead() {
    if (await this.checkServerAvailability()) {
      try {
        return await api.markAllNotificationsAsRead();
      } catch (error) {
        console.warn('Failed to mark all notifications as read via API:', error);
        return { message: 'All notifications marked as read' };
      }
    }
    return { message: 'All notifications marked as read' };
  }

  // Tags
  async getTags() {
    return this.withFallback(
      () => api.getTags(),
      [
        { name: 'javascript', count: 4 },
        { name: 'react', count: 3 },
        { name: 'css', count: 2 },
        { name: 'html', count: 2 },
        { name: 'frontend', count: 1 },
        { name: 'es6', count: 1 },
      ]
    );
  }

  // Utility methods
  getServerStatus() {
    return this.isServerAvailable;
  }

  async forceServerCheck() {
    this.isServerAvailable = null;
    return await this.checkServerAvailability();
  }
}

// Create singleton instance
const dataManager = new DataManager();

export default dataManager;
