import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create auth context
const AuthContext = createContext(null);

// API base URL - automatically detect production vs development
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://your-backend-domain.com/api'  // Replace with your actual backend URL
    : 'http://localhost:4000/api');

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app mount)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile
          const response = await axios.get(`${API_URL}/users/profile`);
          setCurrentUser(response.data);
        }
      } catch (err) {
        // If token is invalid, remove it
        console.error('Auth token validation error:', err);
        localStorage.removeItem('token');
        axios.defaults.headers.common['Authorization'] = '';
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      
      // Save token and set current user
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
      
      return { success: true, data: user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if it's a wallet login
      if (credentials.walletAddress) {
        const response = await axios.post(`${API_URL}/users/wallet-login`, {
          address: credentials.walletAddress,
          signature: credentials.signature,
          message: credentials.message
        });
        
        // Save token and set current user
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCurrentUser(user);
        
        return { success: true, data: user };
      } else {
        // Existing email/password login logic
        const response = await axios.post(`${API_URL}/users/login`, credentials);
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setCurrentUser(user);
        
        return { success: true, data: user };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = '';
    setCurrentUser(null);
    return { success: true };
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData);
      
      // Update current user state with new data
      setCurrentUser(prevUser => ({
        ...prevUser,
        ...response.data.user
      }));
      
      return { success: true, data: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/change-password`, passwordData);
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Submit government ID for verification
  const submitGovVerification = async (verificationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/verify-government-id`, verificationData);
      
      // Update verification status in user state
      setCurrentUser(prevUser => ({
        ...prevUser,
        govVerification: {
          ...prevUser.govVerification,
          method: verificationData.method,
          govId: verificationData.govId,
          isVerified: false // Will be verified by admin later
        }
      }));
      
      return { success: true, message: response.data.message, status: response.data.status };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification submission failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get user activity log
  const getUserActivity = async (userId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = userId ? `${API_URL}/users/activity/${userId}` : `${API_URL}/users/activity`;
      const response = await axios.get(url);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch activity log';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete user account
  const deleteAccount = async (password) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${API_URL}/users/account`, { data: { password } });
      
      // Clear user data after account deletion
      localStorage.removeItem('token');
      axios.defaults.headers.common['Authorization'] = '';
      setCurrentUser(null);
      
      return { success: true, message: 'Account deleted successfully' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Account deletion failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/users/reset-password`, { token, newPassword });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/users/profile/${userId}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!currentUser;

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Generate greeting message based on time of day
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    submitGovVerification,
    getUserActivity,
    deleteAccount,
    forgotPassword,
    resetPassword,
    getUserProfile,
    isAuthenticated,
    hasRole,
    getGreetingMessage // Add the new function here
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
