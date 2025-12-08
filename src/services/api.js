import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout
});

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Server connection error. Make sure JSON Server is running on port 3001.');
      if (!error.config?.skipErrorToast) {
        toast.error('Cannot connect to server. Please make sure JSON Server is running on port 3001.');
      }
    }
    return Promise.reject(error);
  }
);

// Movies API
export const moviesAPI = {
  // Read - Get all movies
  getAllMovies: () => api.get('/movies'),
  
  // Read - Get movie by ID
  getMovieById: (id) => api.get(`/movies/${id}`),
  
  // Create - Add new movie
  createMovie: (movieData) => api.post('/movies', movieData),
  
  // Update - Update movie
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  
  // Delete - Delete movie
  deleteMovie: (id) => api.delete(`/movies/${id}`),
  
  // Get movies by genre
  getMoviesByGenre: (genre) => api.get(`/movies?genre=${genre}`),
};

// Watchlist API
export const watchlistAPI = {
  // Read - Get all watchlist items
  getAllWatchlist: () => api.get('/watchlist'),
  
  // Create - Add to watchlist
  addToWatchlist: (movie) => api.post('/watchlist', movie),
  
  // Delete - Remove from watchlist
  removeFromWatchlist: (id) => api.delete(`/watchlist/${id}`),
  
  // Check if movie is in watchlist
  isInWatchlist: (movieId) => api.get(`/watchlist?movieId=${movieId}`),
};

// Users API
export const usersAPI = {
  // Read - Get all users
  getAllUsers: () => api.get('/users'),
  
  // Read - Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Create - Register new user
  registerUser: (userData) => api.post('/users', userData),
  
  // Find user by username or email
  findUserByUsername: (username) => api.get(`/users?username=${username}`),
  findUserByEmail: (email) => api.get(`/users?email=${email}`),
  
  // Check if username or email exists
  checkUsernameExists: (username) => api.get(`/users?username=${username}`),
  checkEmailExists: (email) => api.get(`/users?email=${email}`),
};

export default api;

