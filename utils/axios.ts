import axios from 'axios';
import { toast } from 'sonner';

// Create a global Axios instance
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token expired or not logged in)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token via backend endpoint
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        // If successful, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log the user out and redirect
        // We can't use NextRouter outside components easily, so window.location is a fallback
        if (typeof window !== 'undefined') {
          // Clear Zustand state could be done via a custom event or directly if we import it,
          // but just redirecting to login will usually re-fetch state if configured right.
          toast.error('Session expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle generic errors
    const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);
