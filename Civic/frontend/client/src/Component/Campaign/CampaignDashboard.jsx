import React, { useState, useEffect } from 'react';
import { useCampaign } from '../../Context/campaignContext';
import { Link } from 'react-router-dom';
import CampaignCreationForm from './CampaignForm';
import { 
  FaChartLine, FaUsers, FaEye, FaFolderOpen, FaPencilAlt, 
  FaSearch, FaFilter, FaTags, FaCalendarAlt, FaArrowUp, FaArrowDown, FaListUl, FaThLarge, FaPlus
} from 'react-icons/fa';

// Campaign status badge with appropriate colors
const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'draft':
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
      case 'completed':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'archived':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusStyles()}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Enhanced Campaign Card
const CampaignCard = ({ campaign, isFeatured = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate days remaining if there's an end date
  const getDaysRemaining = () => {
    if (!campaign.endDate) return null;
    const endDate = new Date(campaign.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Progress calculation - if campaign has a goal
  const progressPercentage = campaign.progressMetrics?.goalProgress || 
    (campaign.engagementMetrics?.supporters 
      ? Math.min(100, Math.round((campaign.engagementMetrics.supporters / 500) * 100))
      : 0);

  return (
    <div 
      className={`group relative bg-white rounded-xl overflow-hidden transition-all duration-300 
        ${isFeatured ? 'shadow-lg ring-2 ring-black' : 'shadow hover:shadow-md'}
        ${isHovered ? 'transform translate-y-[-5px]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isFeatured && (
        <div className="absolute top-3 left-0 z-10 bg-black text-white text-xs font-bold px-3 py-1 rounded-r-full shadow-md">
          FEATURED
        </div>
      )}
      
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {campaign.coverImage ? (
          <img 
            src={campaign.coverImage} 
            alt={campaign.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-500 to-purple-600">
            <span className="text-white text-3xl font-bold">{campaign.title?.charAt(0)}</span>
          </div>
        )}
        
        {/* Elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={campaign.status} />
        </div>
        
        {/* Title overlay for better readability */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-lg font-bold line-clamp-2">{campaign.title}</h3>
        </div>
      </div>
      
      <div className="p-4">
        {/* Campaign description */}
        <p className="text-sm text-gray-600 mb-3 h-10 line-clamp-2">
          {campaign.shortDescription || "No description provided."}
        </p>
        
        {/* Campaign metadata */}
        <div className="flex flex-wrap gap-2 mb-3">
          {campaign.category && (
            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
              <FaTags className="mr-1 text-gray-500" size={10} />
              <span className="capitalize">{campaign.category.replace('-', ' ')}</span>
            </span>
          )}
          
          <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
            <FaCalendarAlt className="mr-1 text-gray-500" size={10} />
            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
          </span>
          
          {campaign.engagementMetrics?.supporters > 0 && (
            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
              <FaUsers className="mr-1 text-gray-500" size={10} />
              <span>{campaign.engagementMetrics.supporters} supporters</span>
            </span>
          )}
        </div>
        
        {/* Progress bar for completed campaigns or campaigns with supporters */}
        {(campaign.status === 'active' || campaign.status === 'completed') && (
          <div className="mt-2 mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">Progress</span>
              <span className="text-xs font-bold text-gray-700">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Due date if available */}
        {daysRemaining !== null && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">Time remaining:</span>
            <span className={`text-xs font-bold ${daysRemaining < 7 ? 'text-red-500' : 'text-gray-700'}`}>
              {daysRemaining} days left
            </span>
          </div>
        )}
        
        {/* Campaign actions */}
        {campaign.creationComplete ? (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Link 
              to={`/campaigns/${campaign._id}`} 
              className="text-black font-medium text-sm hover:underline"
            >
              View Campaign
            </Link>
            <Link 
              to={`/campaigns/${campaign._id}/manage`} 
              className="inline-flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
            >
              <FaPencilAlt size={10} className="mr-1" /> Manage
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center">
              <span className="text-xs text-gray-600 mr-2">Step {campaign.creationStep}/5</span>
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full" 
                  style={{ width: `${(campaign.creationStep / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <Link 
              to={`/campaigns/${campaign._id}/edit`} 
              className="inline-flex items-center text-sm bg-black hover:bg-gray-800 text-white px-3 py-1 rounded transition-colors"
            >
              Continue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Statistics Card with Animation
const StatisticCard = ({ icon, title, value, subtitle, trend, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 ring-indigo-200",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 ring-purple-200",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 ring-blue-200",
    green: "bg-gradient-to-br from-green-50 to-green-100 text-green-700 ring-green-200"
  };

  return (
    <div className={`rounded-xl p-5 ring-1 ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-white/80 shadow-sm text-${color}-600`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center mt-3 text-xs">
          {trend.direction === 'up' ? (
            <FaArrowUp className="text-green-500 mr-1" />
          ) : (
            <FaArrowDown className="text-red-500 mr-1" />
          )}
          <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend.value}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};

// Featured Campaign Spotlight
const FeaturedCampaignSpotlight = ({ campaign }) => {
  if (!campaign) return null;
  
  return (
    <div className="mb-8 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5 h-64 md:h-auto relative">
          {campaign.coverImage ? (
            <img 
              src={campaign.coverImage} 
              alt={campaign.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-600 to-purple-700">
              <span className="text-white text-4xl font-bold">{campaign.title?.charAt(0)}</span>
            </div>
          )}
        </div>
        
        <div className="p-6 md:w-3/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-bold">{campaign.title}</h2>
              <StatusBadge status={campaign.status} />
            </div>
            
            <p className="text-gray-300 mb-4">{campaign.shortDescription}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Supporters</span>
                <span className="font-medium">{campaign.engagementMetrics?.supporters || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Views</span>
                <span className="font-medium">{campaign.engagementMetrics?.views || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-2">
            <Link 
              to={`/campaigns/${campaign._id}`} 
              className="flex-1 text-center bg-white text-black font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              View Campaign
            </Link>
            <Link 
              to={`/campaigns/${campaign._id}/manage`} 
              className="flex-1 text-center border border-white/30 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Manage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Campaign Dashboard Component
const CampaignDashboard = () => {
  const { 
    userCampaigns, 
    teamCampaigns,
    campaignStats,
    getUserCampaigns, 
    getTeamCampaigns,
    getCampaignStats,
    isLoading, 
    error 
  } = useCampaign();
  
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [activeTab, setActiveTab] = useState('my-campaigns');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [featuredCampaign, setFeaturedCampaign] = useState(null);
  const [isUserAuthorized, setIsUserAuthorized] = useState(true); // Example state for authorization
  const [showAddModal, setShowAddModal] = useState(false); // Example state for modal

  useEffect(() => {
    // Load initial data when component mounts
    getUserCampaigns();
    getTeamCampaigns();
    getCampaignStats();
  }, [getUserCampaigns, getTeamCampaigns, getCampaignStats]);
  
  useEffect(() => {
    // Set featured campaign (most active or recent)
    if (userCampaigns && userCampaigns.length > 0) {
      // Find the campaign with the most supporters or most recently updated
      const mostActive = [...userCampaigns].sort((a, b) => 
        (b.engagementMetrics?.supporters || 0) - (a.engagementMetrics?.supporters || 0)
      )[0];
      
      setFeaturedCampaign(mostActive);
    }
  }, [userCampaigns]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    getUserCampaigns({ 
      search: searchTerm,
      status: filterStatus || undefined
    });
  };
  
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    getUserCampaigns({ 
      status,
      search: searchTerm || undefined
    });
  };
  
  const handleCampaignCreated = () => {
    setShowCreationForm(false);
    // Refresh campaign list
    getUserCampaigns();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Campaign Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your advocacy campaigns and track their progress
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowCreationForm(true)}
            className="inline-flex items-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Campaign
          </button>
        </div>
      </div>
      
      {/* Featured Campaign (if available) */}
      {featuredCampaign && activeTab === 'my-campaigns' && (
        <FeaturedCampaignSpotlight campaign={featuredCampaign} />
      )}
      
      {/* Stats Section */}
      {campaignStats && (
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatisticCard 
            icon={<FaFolderOpen size={24} />}
            title="Total Campaigns" 
            value={campaignStats.campaigns?.total || 0}
            color="indigo"
            trend={{
              direction: 'up',
              value: 12,
              label: 'since last month'
            }}
          />
          <StatisticCard 
            icon={<FaChartLine size={24} />}
            title="Active Campaigns" 
            value={campaignStats.campaigns?.active || 0}
            color="purple"
          />
          <StatisticCard 
            icon={<FaUsers size={24} />}
            title="Total Supporters" 
            value={campaignStats.engagement?.totalSupporters || 0}
            color="blue"
            trend={{
              direction: 'up',
              value: 8.5,
              label: 'since last month'
            }}
          />
          <StatisticCard 
            icon={<FaEye size={24} />}
            title="Total Views" 
            value={campaignStats.engagement?.totalViews?.toLocaleString() || 0}
            subtitle="Last updated today"
            color="green"
          />
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`${
                activeTab === 'my-campaigns'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              onClick={() => setActiveTab('my-campaigns')}
            >
              My Campaigns
            </button>
            <button
              className={`${
                activeTab === 'team-campaigns'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              onClick={() => setActiveTab('team-campaigns')}
            >
              Team Campaigns
            </button>
          </nav>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaThLarge size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <FaListUl size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      {activeTab === 'my-campaigns' && (
        <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700 hidden sm:inline-block">
              <FaFilter className="inline mr-1" /> Filter:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterStatus === '' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('draft')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterStatus === 'draft' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => handleStatusFilter('active')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterStatus === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilter('completed')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterStatus === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <div className="relative flex-grow max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black text-sm"
              />
            </div>
            <button
              type="submit"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Search
            </button>
          </form>
        </div>
      )}
      
      {/* Display error if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Display campaigns */}
      {isLoading && (activeTab === 'my-campaigns' ? !userCampaigns.length : !teamCampaigns.length) ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'my-campaigns' ? (
              userCampaigns.length > 0 ? (
                userCampaigns
                  .filter(campaign => campaign._id !== featuredCampaign?._id)
                  .map(campaign => (
                    <CampaignCard key={campaign._id} campaign={campaign} />
                  ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <div className="bg-gray-50 rounded-xl p-10">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns</h3>
                    <p className="mt-2 text-sm text-gray-500">Get started by creating a new campaign.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreationForm(true)}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Campaign
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              teamCampaigns.length > 0 ? (
                teamCampaigns.map(campaign => (
                  <CampaignCard key={campaign._id} campaign={campaign} />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <div className="bg-gray-50 rounded-xl p-10">
                    <h3 className="text-lg font-medium text-gray-900">No team campaigns</h3>
                    <p className="mt-2 text-sm text-gray-500">You're not part of any campaign teams yet.</p>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {activeTab === 'my-campaigns' ? (
              userCampaigns.length > 0 ? (
                userCampaigns.map(campaign => (
                  <div key={campaign._id} className="bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {campaign.coverImage ? (
                          <img 
                            src={campaign.coverImage} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-500 to-purple-600">
                            <span className="text-white text-2xl font-bold">{campaign.title?.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                          <StatusBadge status={campaign.status} />
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2 mb-3 line-clamp-1">{campaign.shortDescription}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {campaign.category && (
                            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <FaTags className="mr-1 text-gray-500" size={10} />
                              <span className="capitalize">{campaign.category.replace('-', ' ')}</span>
                            </span>
                          )}
                          
                          <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <FaCalendarAlt className="mr-1 text-gray-500" size={10} />
                            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </span>
                          
                          {campaign.engagementMetrics?.supporters > 0 && (
                            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <FaUsers className="mr-1 text-gray-500" size={10} />
                              <span>{campaign.engagementMetrics.supporters} supporters</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2 self-center sm:self-end">
                        <Link 
                          to={`/campaigns/${campaign._id}`} 
                          className="bg-black text-white text-center text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          View
                        </Link>
                        <Link 
                          to={`/campaigns/${campaign._id}/manage`} 
                          className="border border-gray-300 bg-white text-gray-700 text-center text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="bg-gray-50 rounded-xl p-10">
                    <h3 className="text-lg font-medium text-gray-900">No campaigns</h3>
                    <p className="mt-2 text-sm text-gray-500">Get started by creating a new campaign.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreationForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
                      >
                        New Campaign
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              teamCampaigns.length > 0 ? (
                teamCampaigns.map(campaign => (
                  <div key={campaign._id} className="bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    {/* Same list view UI as above */}
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {campaign.coverImage ? (
                          <img 
                            src={campaign.coverImage} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-500 to-purple-600">
                            <span className="text-white text-2xl font-bold">{campaign.title?.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                          <StatusBadge status={campaign.status} />
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-2 mb-3 line-clamp-1">{campaign.shortDescription}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {campaign.category && (
                            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <FaTags className="mr-1 text-gray-500" size={10} />
                              <span className="capitalize">{campaign.category.replace('-', ' ')}</span>
                            </span>
                          )}
                          
                          <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <FaCalendarAlt className="mr-1 text-gray-500" size={10} />
                            <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </span>
                          
                          {campaign.engagementMetrics?.supporters > 0 && (
                            <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                              <FaUsers className="mr-1 text-gray-500" size={10} />
                              <span>{campaign.engagementMetrics.supporters} supporters</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2 self-center sm:self-end">
                        <Link 
                          to={`/campaigns/${campaign._id}`} 
                          className="bg-black text-white text-center text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          View
                        </Link>
                        <Link 
                          to={`/campaigns/${campaign._id}/manage`} 
                          className="border border-gray-300 bg-white text-gray-700 text-center text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="bg-gray-50 rounded-xl p-10">
                    <h3 className="text-lg font-medium text-gray-900">No team campaigns</h3>
                    <p className="mt-2 text-sm text-gray-500">You're not part of any campaign teams yet.</p>
                  </div>
                </div>
              )
            )}
          </div>
        )
      )}
      
      {/* Campaign Creation Modal */}
      {showCreationForm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowCreationForm(false)}
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <CampaignCreationForm 
                onSuccess={handleCampaignCreated}
                onCancel={() => setShowCreationForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Button */}
      {isUserAuthorized && (
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 shadow-sm transition-colors"
        >
          <FaPlus className="mr-2" /> Add Activity
        </button>
      )}
    </div>
  );
};

export default CampaignDashboard;