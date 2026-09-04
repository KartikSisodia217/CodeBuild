// Centralized API configuration
// Supports Vercel deployment via VITE_API_BASE_URL environment variable
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
