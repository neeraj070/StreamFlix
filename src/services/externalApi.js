import axios from 'axios';
import { toast } from 'react-toastify';

const RAPIDAPI_KEY = '2ece292388msh72624f895cc9326p142119jsn182dc3e2f6ee';
const RAPIDAPI_HOST = 'imdb8.p.rapidapi.com';

const externalApi = axios.create({
  baseURL: 'https://imdb8.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for error handling
externalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('External API connection error.');
      if (!error.config?.skipErrorToast) {
        toast.error('Cannot connect to movie search API. Please try again later.');
      }
    } else if (error.response?.status === 429) {
      toast.error('API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      toast.error('API authentication failed. Please check API key.');
    }
    return Promise.reject(error);
  }
);

// External Movie Search API
export const externalMovieAPI = {
  // Auto-complete search (primary method)
  autoComplete: async (query) => {
    try {
      const response = await externalApi.get('/title/auto-complete', {
        params: {
          q: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in auto-complete:', error);
      throw error;
    }
  },

  // Search for movies/titles (alternative method)
  searchMovies: async (query) => {
    try {
      const response = await externalApi.get('/title/v2/find', {
        params: {
          q: query,
          limit: 20,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movie details by ID
  getMovieDetails: async (movieId) => {
    try {
      const response = await externalApi.get('/title/get-details', {
        params: {
          tconst: movieId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },

  // Get movie overview/details
  getMovieOverview: async (movieId) => {
    try {
      const response = await externalApi.get('/title/get-overview-details', {
        params: {
          tconst: movieId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie overview:', error);
      throw error;
    }
  },
};

export default externalApi;

