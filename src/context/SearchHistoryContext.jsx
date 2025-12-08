import { createContext, useContext, useState, useEffect } from 'react';

const SearchHistoryContext = createContext(null);

export const SearchHistoryProvider = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem('streamflix_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  const addToHistory = (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    
    const trimmed = searchTerm.trim();
    setSearchHistory(prev => {
      // Remove if already exists and add to beginning
      const filtered = prev.filter(item => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 10); // Keep last 10 searches
      localStorage.setItem('streamflix_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('streamflix_search_history');
  };

  const removeFromHistory = (searchTerm) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== searchTerm);
      localStorage.setItem('streamflix_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };

  return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
};

export const useSearchHistory = () => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used within a SearchHistoryProvider');
  }
  return context;
};
