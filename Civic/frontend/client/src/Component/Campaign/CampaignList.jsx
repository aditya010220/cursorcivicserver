import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaFilter, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaArrowRight, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../../Context/authContext';
import LoadingAnimation from '../Loading/CustomLoading';
import SideNavbar from '../Navbar/sideNavbar';

// Move the function outside of components
const getDaysRemaining = (endDate) => {
  if (!endDate) return null;
  
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

// Move formatDate outside as well since it's used in CampaignCard
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CampaignListing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    status: 'active',
    sort: 'recent'
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { currentUser } = useAuth();
  
  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, [filters]);
  
  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (search) queryParams.append('search', search);
      
      const response = await axios.get(`http://localhost:4000/api/campaigns?${queryParams}`);
      
      if (response.data.success) {
        setCampaigns(response.data.data);
      } else {
        setError('Failed to fetch campaigns');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching campaigns');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCampaigns();
  };
  
  // Category options
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'environment', label: 'Environment' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'human-rights', label: 'Human Rights' },
    { value: 'animal-welfare', label: 'Animal Welfare' },
    { value: 'poverty', label: 'Poverty' },
    { value: 'equality', label: 'Equality' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'governance', label: 'Governance' },
    { value: 'public-safety', label: 'Public Safety' },
    { value: 'other', label: 'Other' }
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingAnimation size="medium" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SideNavbar />
      
      {/* Main content */}
      <div className="flex-1 md:ml-64 p-6">
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover Campaigns</h1>
              <p className="text-gray-600">Find and support causes that matter to you</p>
            </div>
            
            {currentUser && (
              <Link 
                to="/campaigns/create"
                className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition flex items-center justify-center font-medium"
              >
                Start a Campaign
              </Link>
            )}
          </div>
        </header>
        
        {/* Search and filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for campaigns..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <button 
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Filter button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaFilter />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
          
          {/* Filter options */}
          {showFilters && (
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Status filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                {/* Location filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Locations</option>
                    <option value="local">Local</option>
                    <option value="state">State</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
                
                {/* Sort filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="supporters">Most Supporters</option>
                    <option value="trending">Trending</option>
                    <option value="endingSoon">Ending Soon</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Campaign grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(campaign => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any campaigns matching your criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={() => {
                setFilters({
                  category: '',
                  location: '',
                  status: 'active',
                  sort: 'recent'
                });
                setSearch('');
              }}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Campaign Card Component
const CampaignCard = ({ campaign }) => {
  const daysRemaining = getDaysRemaining(campaign?.endDate);
  const supportersCount = campaign.engagementMetrics?.supporters || 0;
  const signatureCount = campaign.engagementMetrics?.signatureCount || 0;
  const progressPercentage = campaign.targetGoal === 'signatures' && campaign.targetNumber 
    ? Math.min(100, Math.round((signatureCount / campaign.targetNumber) * 100))
    : 0;
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
      {/* Campaign Image */}
      <div className="relative h-48 bg-gray-100">
        {campaign.coverImage ? (
          <img 
            src={campaign.coverImage} 
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black bg-opacity-75 text-white px-2 py-1 text-xs font-medium rounded">
            {campaign.category}
          </span>
        </div>
        
        {/* Save button - you can add this functionality later */}
        <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow hover:bg-gray-100">
          <FaRegBookmark className="text-gray-600" />
        </button>
      </div>
      
      {/* Campaign Info */}
      <div className="p-4">
        <Link to={`/campaigns/${campaign._id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-indigo-600 mb-1">
            {campaign.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {campaign.shortDescription || campaign.description}
        </p>
        
        {/* Campaign Stats */}
        <div className="flex items-center text-sm text-gray-500 mb-4 gap-4">
          <div className="flex items-center">
            <FaUsers className="mr-1" />
            <span>{supportersCount} supporters</span>
          </div>
          
          {campaign.location && campaign.location.city && (
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1" />
              <span>{campaign.location.city}</span>
            </div>
          )}
          
          {campaign.startDate && (
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1" />
              <span>{formatDate(campaign.startDate)}</span>
            </div>
          )}
        </div>
        
        {/* Progress bar if campaign has a target */}
        {campaign.targetGoal === 'signatures' && campaign.targetNumber > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{signatureCount} signatures</span>
              <span className="text-gray-500">Target: {campaign.targetNumber}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Days remaining or status */}
        <div className="flex justify-between items-center">
          {daysRemaining !== null ? (
            <span className="text-sm font-medium text-indigo-600">
              {daysRemaining} days remaining
            </span>
          ) : (
            <span className={`text-sm font-medium ${
              campaign.status === 'completed' ? 'text-green-600' : 
              campaign.status === 'active' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </span>
          )}
          
          <Link 
            to={`/campaigns/${campaign._id}`}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View Campaign <FaArrowRight className="ml-1" size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignListing;