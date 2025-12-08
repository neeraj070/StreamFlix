import { createContext, useContext, useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('streamflix_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('streamflix_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Try to find user by username
      let userResponse = await usersAPI.findUserByUsername(username);
      
      // If not found, try by email
      if (userResponse.data.length === 0) {
        userResponse = await usersAPI.findUserByEmail(username);
      }

      if (userResponse.data.length > 0) {
        const foundUser = userResponse.data[0];
        
        // Check password
        if (foundUser.password === password) {
          // Don't store password in localStorage
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('streamflix_user', JSON.stringify(userWithoutPassword));
          return { success: true, user: userWithoutPassword };
        }
      }
      
      return { success: false, error: 'Invalid username or password' };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Failed to connect to server. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('streamflix_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

