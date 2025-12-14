import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('yogaToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  };

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiCall('/auth/verify-token', {
          method: 'POST',
        });

        if (response.success) {
          setUser(response.user);
        } else {
          // Invalid token
          localStorage.removeItem('yogaToken');
          setToken(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('yogaToken');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (loginData) => {
    try {
      setError('');
      setLoading(true);

      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      if (response.success) {
        const { token: newToken, user: userData } = response;
        
        localStorage.setItem('yogaToken', newToken);
        setToken(newToken);
        setUser(userData);
        
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (registerData) => {
    try {
      setError('');
      setLoading(true);

      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      if (response.success) {
        const { token: newToken, user: userData } = response;
        
        localStorage.setItem('yogaToken', newToken);
        setToken(newToken);
        setUser(userData);
        
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('yogaToken');
    setToken(null);
    setUser(null);
    setError('');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await apiCall('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await apiCall('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });

      if (response.success) {
        setUser(prev => ({
          ...prev,
          preferences: response.preferences
        }));
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Progress API calls
  const getProgress = async () => {
    try {
      const response = await apiCall('/progress');
      return response.success ? response.progress : null;
    } catch (error) {
      console.error('Get progress error:', error);
      return null;
    }
  };

  const addSession = async (sessionData) => {
    try {
      const response = await apiCall('/progress/session', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      return response.success ? response.progress : null;
    } catch (error) {
      console.error('Add session error:', error);
      return null;
    }
  };

  const addAchievement = async (achievementData) => {
    try {
      const response = await apiCall('/progress/achievement', {
        method: 'POST',
        body: JSON.stringify(achievementData),
      });
      return response.success ? { isNew: response.isNew, progress: response.progress } : null;
    } catch (error) {
      console.error('Add achievement error:', error);
      return null;
    }
  };

  const getStats = async () => {
    try {
      const response = await apiCall('/progress/stats');
      return response.success ? response.stats : null;
    } catch (error) {
      console.error('Get stats error:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    getProgress,
    addSession,
    addAchievement,
    getStats,
    apiCall,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};