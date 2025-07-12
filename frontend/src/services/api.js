// API Service for StackIt Frontend
// Handles all communication with the backend server

const API_BASE_URL = "/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Questions API
  async getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/questions?${queryString}` : "/questions";
    return this.request(endpoint);
  }

  async getQuestion(id) {
    return this.request(`/questions/${id}`);
  }

  async createQuestion(questionData) {
    return this.request("/questions", {
      method: "POST",
      body: questionData,
    });
  }

  async voteOnQuestion(questionId, voteType) {
    return this.request(`/questions/${questionId}/vote`, {
      method: "POST",
      body: { type: voteType }, // 'up' or 'down'
    });
  }

  async searchQuestions(query) {
    return this.request(`/search?q=${encodeURIComponent(query)}`);
  }

  // Answers API
  async getAnswersForQuestion(questionId) {
    return this.request(`/questions/${questionId}/answers`);
  }

  async createAnswer(questionId, answerData) {
    return this.request(`/questions/${questionId}/answers`, {
      method: "POST",
      body: answerData,
    });
  }

  async voteOnAnswer(answerId, voteType) {
    return this.request(`/answers/${answerId}/vote`, {
      method: "POST",
      body: { type: voteType }, // 'up' or 'down'
    });
  }

  async acceptAnswer(answerId) {
    return this.request(`/answers/${answerId}/accept`, {
      method: "POST",
    });
  }

  // Notifications API
  async getNotifications(unreadOnly = false) {
    const endpoint = unreadOnly
      ? "/notifications?unreadOnly=true"
      : "/notifications";
    return this.request(endpoint);
  }

  async getUnreadNotificationCount() {
    return this.request("/notifications/unread-count");
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/notifications/mark-all-read", {
      method: "PUT",
    });
  }

  // Tags API
  async getTags() {
    return this.request("/tags");
  }

  // Health check
  async getHealth() {
    return this.request("/health");
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Export individual methods for easier use
export const api = {
  // Questions
  getQuestions: (params) => apiService.getQuestions(params),
  getQuestion: (id) => apiService.getQuestion(id),
  createQuestion: (data) => apiService.createQuestion(data),
  voteOnQuestion: (id, type) => apiService.voteOnQuestion(id, type),
  searchQuestions: (query) => apiService.searchQuestions(query),

  // Answers
  getAnswersForQuestion: (questionId) =>
    apiService.getAnswersForQuestion(questionId),
  createAnswer: (questionId, data) => apiService.createAnswer(questionId, data),
  voteOnAnswer: (id, type) => apiService.voteOnAnswer(id, type),
  acceptAnswer: (id) => apiService.acceptAnswer(id),

  // Notifications
  getNotifications: (unreadOnly) => apiService.getNotifications(unreadOnly),
  getUnreadNotificationCount: () => apiService.getUnreadNotificationCount(),
  markNotificationAsRead: (id) => apiService.markNotificationAsRead(id),
  markAllNotificationsAsRead: () => apiService.markAllNotificationsAsRead(),

  // Tags
  getTags: () => apiService.getTags(),

  // Health
  getHealth: () => apiService.getHealth(),
};

export default api;
