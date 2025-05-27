// API base configuration
const API_BASE_URL = "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API call failed");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
};

// Auth API calls
export const authAPI = {
  login: (credentials) =>
    apiCall("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiCall("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => apiCall("/users/me"),
};

// Users API calls
export const usersAPI = {
  getAllUsers: () => apiCall("/users"),

  deleteUser: (userId) =>
    apiCall(`/users/${userId}`, {
      method: "DELETE",
    }),
    
  addAdminOrTechnician: (userData) =>
    apiCall("/users/add-user", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
};

// Support Requests API calls
export const supportRequestsAPI = {
  getAllRequests: () => apiCall("/requests"),

  createRequest: (requestData) =>
    apiCall("/supportRequests", {
      method: "POST",
      body: JSON.stringify(requestData),
    }),

  updateRequest: (requestId, updateData) =>
    apiCall(`/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  deleteRequest: (requestId) =>
    apiCall(`/supportRequests/${requestId}`, {
      method: "DELETE",
    }),
};

// Quote Requests API calls
export const quoteRequestsAPI = {
  getAllQuotes: () => apiCall("/quoteRequests"),

  createQuote: (quoteData) =>
    apiCall("/quoteRequests", {
      method: "POST",
      body: JSON.stringify(quoteData),
    }),

  updateQuote: (quoteId, updateData) =>
    apiCall(`/quoteRequests/${quoteId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  deleteQuote: (quoteId) =>
    apiCall(`/quoteRequests/${quoteId}`, {
      method: "DELETE",
    }),
};
