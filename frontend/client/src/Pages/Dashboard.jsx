import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/authContext';
import { useCampaign } from '../Context/campaignContext';
import SideNavbar from '../Component/Navbar/sideNavbar';
import LoadingAnimation from '../Component/Loading/CustomLoading';
import ProfileGlimpse from '../Component/Profile/ProfileGlimpse';
import NewsFeed from '../Component/Dashboard/NewsFeed';
import CampaignsAroundYou from '../Component/Dashboard/CompaignAroundYou';
import TrendingCampaigns from '../Component/Dashboard/TrendingCampaigns';
import { FaBell, FaPlus, FaClipboardList, FaChartLine, FaNewspaper, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { currentUser, getGreetingMessage } = useAuth();
  const { 
    getUserCampaigns, 
    getCampaignStats, 
    campaignStats, 
    userCampaigns, 
    isLoading: campaignsLoading 
  } = useCampaign();
  
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // Use ref to track if data has been fetched
  const initialDataFetched = useRef(false);
  
  useEffect(() => {
    // Function to fetch data
    const fetchCampaignData = async () => {
      if (!initialDataFetched.current) {
        try {
          await getUserCampaigns({ limit: 10 });
          
          try {
            await getCampaignStats();
          } catch (statsError) {
            console.log("Could not load campaign stats, continuing anyway");
          }
          
          initialDataFetched.current = true;
        } catch (error) {
          console.error("Error fetching campaign data:", error);
          initialDataFetched.current = true;
        }
      }
    };
    
    if (currentUser) {
      setUserData(currentUser);
      setIsLoading(false);
      fetchCampaignData();
    } else {
      setIsLoading(true);
    }
  }, [currentUser, getUserCampaigns, getCampaignStats]);

  // User Campaign Dashboard Component
  const UserCampaignDashboard = () => {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 h-full">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <div className="flex items-center">
            <FaClipboardList className="text-gray-700 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">My Campaigns</h2>
          </div>
          <Link 
            to="/campaigns/create" 
            className="flex items-center bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            <FaPlus className="mr-1" size={12} />
            New Campaign
          </Link>
        </div>
        
        <div className="p-5 overflow-auto" style={{ maxHeight: "calc(70vh - 150px)" }}>
          {userCampaigns && userCampaigns.length > 0 ? (
            <div className="space-y-4">
              {userCampaigns.slice(0, 5).map(campaign => (
                <Link to={`/campaigns/${campaign._id}`} key={campaign._id} className="block">
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="w-1/4 bg-gray-100 h-24">
                      <img 
                        src={campaign.coverImage || 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=500&q=60'}
                        alt={campaign.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="w-3/4 p-3">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                          {campaign.category || 'General'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mt-2 line-clamp-1">{campaign.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{campaign.shortDescription}</p>
                      
                      <div className="mt-2 flex justify-between text-xs">
                        <div className="flex items-center text-gray-700">
                          <span>{campaign.engagementMetrics?.supporters || 0} supporters</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            campaign.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status || 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">You haven't created any campaigns yet.</p>
              <Link 
                to="/campaigns/create" 
                className="mt-4 inline-block bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create Your First Campaign
              </Link>
            </div>
          )}
          
          {userCampaigns && userCampaigns.length > 5 && (
            <div className="mt-4 text-center">
              <Link to="/campaigns" className="text-sm text-gray-600 hover:text-black">
                View all campaigns ({userCampaigns.length})
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SideNavbar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <LoadingAnimation size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Side Navigation */}
      <SideNavbar />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-4 pr-4 pl-6 flex flex-col" style={{ height: "calc(100vh - 24px)" }}>
        {/* Enhanced Header with Profile Stats */}
        <header className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreetingMessage()}, {userData.fullName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Here's what's happening with your campaigns and in your area
            </p>
          </div>
          
          {/* Profile Stats Bookmark */}
          <div className="flex items-center">
            {userData?.profilePicture ? (
              <img 
                src={userData.profilePicture} 
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-500 font-bold text-lg border-2 border-white shadow">
                {userData?.fullName?.[0] || 'U'}
              </div>
            )}
            
            <div className="flex bg-black text-white rounded-lg shadow-md overflow-hidden ml-2">
              <div className="px-3 py-1.5 text-center border-r border-gray-700">
                <div className="text-sm font-bold">{userData?.impactScore || 0}</div>
                <div className="text-xs text-gray-300 flex items-center justify-center">
                  <FaChartLine className="mr-1" size={8} /> Impact
                </div>
              </div>
              
              <div className="px-3 py-1.5 text-center border-r border-gray-700">
                <div className="text-sm font-bold">{userCampaigns?.length || 0}</div>
                <div className="text-xs text-gray-300 flex items-center justify-center">
                  <FaNewspaper className="mr-1" size={8} /> Campaigns
                </div>
              </div>
              
              <div className="px-3 py-1.5 text-center">
                <div className="text-sm font-bold">{userData?.followersCount || 0}</div>
                <div className="text-xs text-gray-300 flex items-center justify-center">
                  <FaUsers className="mr-1" size={8} /> Network
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Top section - Two Sections Row (redistributed space) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6" style={{ height: "40%" }}>
          {/* News Feed - increased columns from 5 to 7 */}
          <div className="lg:col-span-7 h-full overflow-hidden">
            <div className="h-full overflow-auto">
              <NewsFeed />
            </div>
          </div>
          
          {/* Campaigns Around You - increased columns from 4 to 5 */}
          <div className="lg:col-span-5 h-full overflow-hidden">
            <div className="h-full overflow-auto">
              <CampaignsAroundYou />
            </div>
          </div>
        </div>
        
        {/* Bottom section - Campaign Dashboard (70%) and Trending (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 flex-1" style={{ height: "calc(60% - 80px)" }}>
          {/* User Campaign Dashboard - 70% width (7/10 cols) */}
          <div className="lg:col-span-7 h-full overflow-hidden">
            <UserCampaignDashboard />
          </div>
          
          {/* Trending Campaigns - 30% width (3/10 cols) */}
          <div className="lg:col-span-3 h-full overflow-hidden">
            <div className="h-full overflow-auto">
              <TrendingCampaigns />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;