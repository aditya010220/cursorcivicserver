import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';

// Create the Context
const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
  // --- State ---
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [teamCampaigns, setTeamCampaigns] = useState([]);
  const [campaignStats, setCampaignStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    total: 0, 
    pages: 0 
  });
  
  // Get auth context
  const { currentUser } = useAuth();
  
  // Create a stable API reference that updates when auth changes
  const apiRef = useRef(null);
  const apiBaseUrl ='http://localhost:4000/api';
  
  
  // Update API instance when auth changes
  useEffect(() => {
    // Setup axios instance with authentication
    const token = localStorage.getItem('token');
    
    apiRef.current = axios.create({
      baseURL: 'http://localhost:4000/api/campaigns',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    // Add request interceptor to always use latest token
    apiRef.current.interceptors.request.use(
      (config) => {
        // Try to get the most up-to-date token on each request
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers['Authorization'] = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }, [currentUser]);

  // Track data loading state - this won't change on re-renders
  const dataFetchedRef = useRef({
    userCampaigns: false,
    teamCampaigns: false,
    campaignStats: false
  });
  
  // Request in progress tracking - this won't change on re-renders
  const loadingRequestRef = useRef({
    userCampaigns: false,
    teamCampaigns: false,
    campaignStats: false
  });

  // --- API Functions ---

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user campaigns
  const getUserCampaigns = useCallback(async (params = {}) => {
    // Skip if already loading
    if (loadingRequestRef.current.userCampaigns) {
      return userCampaigns;
    }
    
    loadingRequestRef.current.userCampaigns = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const { page = 1, limit = 10, status, sort, order, search } = params;
      const queryParams = new URLSearchParams();
      
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (status) {
        if (Array.isArray(status)) {
          status.forEach(s => queryParams.append('status', s));
        } else {
          queryParams.append('status', status);
        }
      }
      
      if (sort) queryParams.append('sort', sort);
      if (order) queryParams.append('order', order);
      if (search) queryParams.append('search', search);
      
      const response = await apiRef.current.get(`/my-campaigns?${queryParams.toString()}`);
      
      const campaigns = response.data.data || [];
      const paginationData = response.data.pagination || { 
        page, 
        limit, 
        total: campaigns.length, 
        pages: Math.ceil(campaigns.length / limit) 
      };
      
      setUserCampaigns(campaigns);
      setPagination(paginationData);
      dataFetchedRef.current.userCampaigns = true;
      
      return campaigns;
    } catch (err) {
      console.error("Error fetching user campaigns:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch your campaigns');
      return [];
    } finally {
      setIsLoading(false);
      loadingRequestRef.current.userCampaigns = false;
    }
  }, []);

  // Get team campaigns
  const getTeamCampaigns = useCallback(async () => {
    // Skip if already loading
    if (loadingRequestRef.current.teamCampaigns) {
      return teamCampaigns;
    }
    
    loadingRequestRef.current.teamCampaigns = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRef.current.get('/team-campaigns');
      const campaigns = response.data.data || [];
      
      setTeamCampaigns(campaigns);
      dataFetchedRef.current.teamCampaigns = true;
      
      return campaigns;
    } catch (err) {
      console.error("Error fetching team campaigns:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch team campaigns');
      return [];
    } finally {
      setIsLoading(false);
      loadingRequestRef.current.teamCampaigns = false;
    }
  }, []);

  // Get campaign stats - FIX: Use campaign-stats instead of stats
  const getCampaignStats = useCallback(async () => {
    // Skip if already loading
    if (loadingRequestRef.current.campaignStats) {
      return campaignStats;
    }
    
    loadingRequestRef.current.campaignStats = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRef.current.get('/campaign-stats');
      const stats = response.data.data || null;
      
      setCampaignStats(stats);
      dataFetchedRef.current.campaignStats = true;
      
      return stats;
    } catch (err) {
      console.error("Error fetching campaign stats:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch campaign statistics');
      
      // Mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        // Get the latest userCampaigns state directly within the function
        const currentCampaigns = userCampaigns;
        
        const mockStats = {
          campaigns: {
            total: currentCampaigns.length || 0,
            active: currentCampaigns.filter(c => c.status === 'active').length || 0,
            draft: currentCampaigns.filter(c => c.status === 'draft').length || 0,
            completed: currentCampaigns.filter(c => c.status === 'completed').length || 0
          },
          engagement: {
            totalViews: 0,
            totalShares: 0,
            totalLikes: 0,
            totalComments: 0,
            totalSupporters: 0,
            totalSignatures: 0
          },
          popularCampaigns: [],
          recentTeamMembers: []
        };
        
        setCampaignStats(mockStats);
        return mockStats;
      }
      
      return null;
    } finally {
      setIsLoading(false);
      loadingRequestRef.current.campaignStats = false;
    }
  }, []); // No dependencies

  // Create campaign
  const createCampaign = useCallback(async (campaignData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRef.current.post('/', campaignData);
      const newCampaign = response.data.data || response.data;
      
      // Add to user campaigns if needed
      setUserCampaigns(prev => [newCampaign, ...prev]);
      
      return newCampaign;
    } catch (err) {
      console.error("Error creating campaign:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update campaign
  const updateCampaign = useCallback(async (campaignId, updateData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRef.current.put(`/${campaignId}`, updateData);
      const updatedCampaign = response.data.data || response.data;
      
      // Update in campaigns list
      setUserCampaigns(prev => 
        prev.map(campaign => campaign._id === campaignId ? updatedCampaign : campaign)
      );
      
      return updatedCampaign;
    } catch (err) {
      console.error("Error updating campaign:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update campaign step
  const updateCampaignStep = async (campaignId, step, data) => {
    setIsLoading(true);
    try {
      // Get the current token from localStorage to ensure we have the latest one
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Format communicationChannels.other if present in team data (step 2)
      let formattedData = { ...data };
      
      if (step === 2 && data.communicationChannels && typeof data.communicationChannels.other === 'string') {
        formattedData.communicationChannels = {
          ...data.communicationChannels,
          other: data.communicationChannels.other ? 
            [{ name: 'Other', url: data.communicationChannels.other }] : []
        };
      }
      
      const response = await axios.put(
        `${apiBaseUrl}/campaigns/${campaignId}/step`,
        { step, data: formattedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsLoading(false);
      return response.data.data;
    } catch (error) {
      setIsLoading(false);
      console.error("Error updating campaign step " + step + ": ", error.response?.data);
      setError(error.response?.data?.message || `Error updating campaign step ${step}`);
      throw error;
    }
  };

  // Delete campaign
  const deleteCampaign = useCallback(async (campaignId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiRef.current.delete(`/${campaignId}`);
      
      // Remove from campaigns list
      setUserCampaigns(prev => prev.filter(campaign => campaign._id !== campaignId));
      
      return true;
    } catch (err) {
      console.error("Error deleting campaign:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete campaign');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single campaign by ID
  const fetchCampaign = useCallback(async (campaignId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRef.current.get(`/${campaignId}`);
      const campaign = response.data.data || response.data;
      console.log(campaign)
      // Update current campaign in state
      setCurrentCampaign(campaign);
      
      return campaign;
    } catch (err) {
      console.error("Error fetching campaign details:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch campaign details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a stable context value that won't change unless the state changes
  const contextValue = {
    // State
    currentCampaign,
    userCampaigns,
    teamCampaigns,
    campaignStats,
    isLoading,
    error,
    uploadProgress,
    pagination,
    
    // Basic CRUD operations
    createCampaign,
    updateCampaign,
    updateCampaignStep,
    deleteCampaign,
    fetchCampaign,
    
    // List operations
    getUserCampaigns,
    getTeamCampaigns,
    getCampaignStats,
    
    // Utilities
    clearError,
    
    // Tracking
    dataFetched: dataFetchedRef.current
  };

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};

// Custom Hook to use the Context
export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};