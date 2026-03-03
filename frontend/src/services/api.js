import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('name');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Expense API
export const expenseAPI = {
  getDashboard: () => api.get('/expenses/dashboard'),
  getAllExpenses: () => api.get('/expenses'),
  addExpense: (data) => api.post('/expenses', data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  
  // New unified filter endpoint - supports category, date range, and amount range
  // All parameters are optional
  getExpensesWithFilters: (filters) => {
    const params = {};
    
    if (filters.category && filters.category !== 'All') {
      params.category = filters.category;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters.minAmount && filters.minAmount !== '') {
      params.minAmount = filters.minAmount;
    }
    if (filters.maxAmount && filters.maxAmount !== '') {
      params.maxAmount = filters.maxAmount;
    }
    
    return api.get('/expenses/filter', { params });
  },
  
  // Legacy endpoints - kept for backward compatibility
  getExpensesByDateRange: (startDate, endDate) => 
    api.get('/expenses/filter/date', { params: { startDate, endDate } }),
  getExpensesByCategory: (category) => 
    api.get(`/expenses/category/${category}`),
  getExpensesByCategoryAndDateRange: (category, startDate, endDate) => 
    api.get(`/expenses/category/${category}/filter`, { params: { startDate, endDate } }),
  getExpensesSorted: (ascending) => 
    api.get('/expenses/sort', { params: { ascending } }),
};

// Budget API
export const budgetAPI = {
  setBudget: (data) => api.post('/budget', data),
  getBudgetsByMonth: (month) => api.get(`/budget/${month}`),
  getBudgetStatus: (month) => api.get(`/budget/status/${month}`),
  deleteBudget: (budgetId) => api.delete(`/budget/${budgetId}`),
};

// Recurring Expense API
export const recurringExpenseAPI = {
  getAllRecurringExpenses: () => api.get('/recurring'),
  createRecurringExpense: (data) => api.post('/recurring', data),
  toggleRecurringExpense: (id) => api.put(`/recurring/${id}/toggle`),
  deleteRecurringExpense: (id) => api.delete(`/recurring/${id}`),
};

// Alerts API
export const alertsAPI = {
  getAlerts: () => api.get('/alerts'),
};

