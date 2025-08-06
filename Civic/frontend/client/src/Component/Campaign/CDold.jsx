import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaTag, 
  FaSignature, FaShareAlt, FaChartLine, FaClipboardList, 
  FaPhotoVideo, FaHistory, FaUsers, FaUserShield, FaGavel, 
  FaWrench, FaCogs, FaComments, FaFileUpload, FaEdit, FaCamera
} from 'react-icons/fa';
import { useAuth } from '../../Context/authContext';
import { useCampaign } from '../../Context/campaignContext';
import LoadingAnimation from '../Loading/CustomLoading';
import SideNavbar from '../Navbar/sideNavbar';

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { currentUser } = useAuth();
  const { 
    currentCampaign, 
    fetchCampaign, 
    isLoading, 
    error 
  } = useCampaign();
  
  // Modal state for cover image upload/generation
  const [showCoverModal, setShowCoverModal] = useState(false);

  // Fetch campaign data when component mounts or campaignId changes
  useEffect(() => {
    if (campaignId) {
      fetchCampaign(campaignId);
    }
  }, [campaignId, fetchCampaign]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to check if user is campaign creator or team member
  const isUserAuthorized = () => {
    if (!currentUser || !currentCampaign) return false;
    
    // Check if user is creator
    if (currentCampaign.createdBy && currentCampaign.createdBy._id === currentUser.id) {
      return true;
    }
    
    // Check if user is team member
    if (currentCampaign.team) {
      const allMembers = [
        currentCampaign.team.leader,
        currentCampaign.team.coLeader,
        currentCampaign.team.socialMediaCoordinator,
        currentCampaign.team.volunteerCoordinator,
        currentCampaign.team.financeManager,
        ...(currentCampaign.team.additionalMembers || [])
      ].filter(Boolean);
      
      return allMembers.some(member => 
        member && member.userId && member.userId === currentUser.id
      );
    }
    
    return false;
  };
  
  // Component for Tab navigation sidebar
  const CampaignSidebar = () => {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-full fixed left-64 z-10 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-lg text-gray-800">Campaign Menu</h3>
        </div>
        
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'overview' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaChartLine className="mr-3" />
                <span>Overview</span>
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('updates')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'updates' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaHistory className="mr-3" />
                <span>Updates</span>
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'evidence' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaClipboardList className="mr-3" />
                <span>Evidence ({currentCampaign.evidence?.length || 0})</span>
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'gallery' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaPhotoVideo className="mr-3" />
                <span>Gallery</span>
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'activity' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaHistory className="mr-3" />
                <span>Activity Timeline</span>
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'team' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaUsers className="mr-3" />
                <span>Team</span>
              </button>
            </li>
            
            {currentCampaign.hasVictims && (
              <li>
                <button
                  onClick={() => setActiveTab('victims')}
                  className={`flex items-center w-full px-3 py-2 rounded-md ${
                    activeTab === 'victims' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaUserShield className="mr-3" />
                  <span>Victims</span>
                </button>
              </li>
            )}
            
            <li className="pt-4 border-t border-gray-200 mt-4">
              <h4 className="px-3 text-xs text-gray-500 uppercase font-semibold mb-2">
                Support Tools
              </h4>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('expert')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'expert' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaComments className="mr-3" />
                <span>Talk to Expert</span>
              </button>
            </li>
            
            <li>
              <button
                onClick={() => setActiveTab('legal')}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'legal' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaGavel className="mr-3" />
                <span>LegalEye</span>
              </button>
            </li>
            
            {/* Only show if user is authorized */}
            {isUserAuthorized() && (
              <>
                <li className="pt-4 border-t border-gray-200 mt-4">
                  <h4 className="px-3 text-xs text-gray-500 uppercase font-semibold mb-2">
                    Admin Tools
                  </h4>
                </li>
                
                <li>
                  <button
                    onClick={() => setActiveTab('manage')}
                    className={`flex items-center w-full px-3 py-2 rounded-md ${
                      activeTab === 'manage' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaWrench className="mr-3" />
                    <span>Manage Campaign</span>
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center w-full px-3 py-2 rounded-md ${
                      activeTab === 'settings' 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaCogs className="mr-3" />
                    <span>Campaign Settings</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    );
  };
  
  // Banner component with cover image controls
  const BannerSection = () => {
    return (
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white relative">
          {/* Cover image */}
          {currentCampaign.coverImage ? (
            <div className="absolute inset-0 opacity-20">
              <img 
                src={currentCampaign.coverImage} 
                alt={currentCampaign.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-4 flex items-center">
                  <Link to="/dashboard" className="text-white opacity-75 hover:opacity-100 flex items-center mr-4">
                    <FaArrowLeft className="mr-2" /> Back
                  </Link>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-800 uppercase">
                    {currentCampaign.category?.replace(/-/g, ' ')}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{currentCampaign.title}</h1>
                <p className="text-lg md:text-xl opacity-90 mb-4">{currentCampaign.shortDescription}</p>
                <div className="flex flex-wrap items-center text-sm opacity-75 gap-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>Started on {formatDate(currentCampaign.createdAt)}</span>
                  </div>
                  
                  {currentCampaign.location && (currentCampaign.location.city || currentCampaign.location.state || currentCampaign.location.country) && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>
                        {[
                          currentCampaign.location.city,
                          currentCampaign.location.state,
                          currentCampaign.location.country
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {currentCampaign.createdBy && (
                    <div className="flex items-center">
                      <FaUser className="mr-2" />
                      <span>Created by {currentCampaign.createdBy.fullName || "Anonymous"}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex flex-col items-center">
                <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-md rounded-lg p-4 shadow-lg text-center">
                  <div className="text-3xl font-bold">{currentCampaign.engagementMetrics?.supporters || 0}</div>
                  <div className="text-sm">Supporters</div>
                </div>
                
                <div className="flex mt-4 space-x-2">
                  <button className="flex-1 bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-lg shadow flex items-center justify-center font-medium">
                    <FaSignature className="mr-2" /> Sign
                  </button>
                  <button className="bg-indigo-800 bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-lg shadow">
                    <FaShareAlt />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit cover image button - only for authorized users */}
          {isUserAuthorized() && (
            <button 
              onClick={() => setShowCoverModal(true)}
              className="absolute top-4 right-4 bg-black bg-opacity-40 hover:bg-opacity-60 text-white p-2 rounded-lg flex items-center"
            >
              <FaCamera className="mr-1" /> 
              <span className="text-sm">Edit Cover</span>
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Mobile tab navigation for smaller screens
  const MobileTabBar = () => (
    <div className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="px-4 py-2">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="overview">Overview</option>
            <option value="updates">Updates</option>
            <option value="evidence">Evidence ({currentCampaign.evidence?.length || 0})</option>
            <option value="gallery">Gallery</option>
            <option value="activity">Activity Timeline</option>
            <option value="team">Team</option>
            {currentCampaign.hasVictims && <option value="victims">Victims</option>}
            <option value="expert">Talk to Expert</option>
            <option value="legal">LegalEye</option>
            {isUserAuthorized() && <option value="manage">Manage Campaign</option>}
            {isUserAuthorized() && <option value="settings">Campaign Settings</option>}
          </select>
        </div>
      </div>
    </div>
  );
  
  // Team Section Component
  const TeamSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Campaign Team</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Leader Card */}
        {currentCampaign.team?.leader && (
          <div className="border-2 border-indigo-400 rounded-lg p-4 bg-indigo-50 relative">
            <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Leader
            </div>
            <div className="flex items-center mb-4 mt-4">
              <div className="w-14 h-14 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                {currentCampaign.team.leader.profileImage ? (
                  <img 
                    src={currentCampaign.team.leader.profileImage} 
                    alt={currentCampaign.team.leader.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <FaUser className="text-indigo-600 text-2xl" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-900">{currentCampaign.team.leader.name}</h3>
                <p className="text-sm text-gray-500">{currentCampaign.team.leader.email || ''}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Campaign leader responsible for overall direction and strategy.
            </p>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">
              Contact
            </button>
          </div>
        )}
        
        {/* Co-Leader Card */}
        {currentCampaign.team?.coLeader && currentCampaign.team.coLeader.userId && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                {currentCampaign.team.coLeader.profileImage ? (
                  <img 
                    src={currentCampaign.team.coLeader.profileImage} 
                    alt={currentCampaign.team.coLeader.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <FaUser className="text-indigo-500 text-xl" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-900">{currentCampaign.team.coLeader.name}</h3>
                <p className="text-sm text-gray-500">Co-Leader</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Assists the campaign leader and shares leadership responsibilities.
            </p>
            <button className="w-full bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 text-sm">
              Contact
            </button>
          </div>
        )}
        
        {/* Social Media Coordinator */}
        {currentCampaign.team?.socialMediaCoordinator && currentCampaign.team.socialMediaCoordinator.userId && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <FaUser className="text-indigo-500 text-xl" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-900">{currentCampaign.team.socialMediaCoordinator.name}</h3>
                <p className="text-sm text-gray-500">Social Media</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Manages social media presence and digital communication.
            </p>
            <button className="w-full bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 text-sm">
              Contact
            </button>
          </div>
        )}
        
        {/* Add other team members as needed */}
        
      </div>
    </div>
  );
  
  // Evidence component - reuse the EvidenceStep but in view mode
  const EvidenceSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Campaign Evidence</h2>
      
      {isUserAuthorized() && (
        <div className="mb-6">
          <button className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
            <FaFileUpload className="mr-2" /> Upload New Evidence
          </button>
        </div>
      )}
      
      {currentCampaign.evidence && currentCampaign.evidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCampaign.evidence.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {item.mediaFile?.url && item.evidenceType === 'photo' && (
                <div className="h-48 bg-gray-100">
                  <img 
                    src={item.mediaFile.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="capitalize text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                    {item.evidenceType.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    item.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {item.description}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Source: {item.source}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Evidence Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There is currently no evidence attached to this campaign. Evidence helps strengthen the campaign's case and provides transparency to supporters.
          </p>
        </div>
      )}
    </div>
  );
  
  // Gallery Section with upload support
  const GallerySection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Campaign Gallery</h2>
      
      {isUserAuthorized() && (
        <div className="mb-6">
          <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
            <FaCamera className="mr-2" /> Add Photos
          </button>
        </div>
      )}
      
      {/* Gallery content will go here */}
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Photos Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          There are no photos in the gallery yet. Add photos to give supporters a visual understanding of your campaign.
        </p>
      </div>
    </div>
  );
  
  // Activity Timeline Section
  const ActivityTimeline = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Activity Timeline</h2>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-0 bottom-0 left-5 md:left-7 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-8">
          {/* Sample activity items - replace with real data */}
          <div className="relative pl-10 md:pl-14">
            <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-green-100 rounded-full border-4 border-white z-10">
              <FaEdit className="text-green-600" />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">Campaign Created</h3>
                <span className="text-xs text-gray-500">{formatDate(currentCampaign.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {currentCampaign.createdBy?.fullName || 'Someone'} created this campaign.
              </p>
            </div>
          </div>
          
          {/* Add more activity items dynamically based on campaign updates and activity */}
          
          {/* Example of adding evidence */}
          {currentCampaign.evidence && currentCampaign.evidence.length > 0 && (
            <div className="relative pl-10 md:pl-14">
              <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full border-4 border-white z-10">
                <FaClipboardList className="text-blue-600" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">Evidence Added</h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(currentCampaign.evidence[0].createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  New evidence was added to the campaign: "{currentCampaign.evidence[0].title}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Victims Section
  const VictimsSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Campaign Victims</h2>
      
      {currentCampaign.victims && currentCampaign.victims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCampaign.victims.map((victim, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">
                  {victim.privacyLevel === 'public' ? victim.name : 'Anonymous Victim'}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {victim.privacyLevel === 'public' ? victim.story : 'This victim has chosen to remain anonymous. Their story is kept private to protect their identity.'}
                </p>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">
                  Support
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Victim Information</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There is no victim information associated with this campaign.
          </p>
        </div>
      )}
    </div>
  );
  
  // Expert Help Section
  const ExpertHelpSection = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Expert Consultation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <FaComments className="text-indigo-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Talk to an Expert</h3>
          <p className="text-gray-600 mb-4">
            Connect with experienced activists and professionals in your campaign's area of focus. Get guidance on strategy, outreach, and more.
          </p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
            Request Consultation
          </button>
        </div>
        
        <div className="border rounded-lg p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <FaGavel className="text-amber-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">LegalEye Support</h3>
          <p className="text-gray-600 mb-4">
            Get legal advice related to your campaign from our network of volunteer legal professionals. Understand your rights and legal options.
          </p>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 shadow-sm">
            Request Legal Help
          </button>
        </div>
      </div>
    </div>
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SideNavbar />
        <div className="flex-1 md:ml-64 p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Link to="/dashboard" className="flex items-center text-indigo-600 hover:text-indigo-800">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SideNavbar />
        <div className="flex-1 md:ml-64 p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
            <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
            <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideNavbar />
      
      <div className="flex-1 md:ml-64 pb-10">
        {/* Banner Area */}
        <BannerSection />
        
        {/* Mobile Tab Navigation */}
        <MobileTabBar />
        
        {/* Main Content Area with Sidebar */}
        <div className="relative">
          {/* Campaign Side Navigation - Hidden on mobile */}
          <CampaignSidebar />
          
          {/* Main Content */}
          <div className="md:ml-64 p-4 md:p-6">
            {/* Render content based on active tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">About this Campaign</h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{currentCampaign.description}</p>
                  </div>
                  
                  {currentCampaign.tags && currentCampaign.tags.length > 0 && (
                    <div className="mt-6">
                      <div className="flex flex-wrap gap-2">
                        {currentCampaign.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                          >
                            <FaTag className="mr-1 text-gray-500" size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TeamSection />
                  <div className="space-y-6">
                    <EvidenceSection />
                    <ExpertHelpSection />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'team' && <TeamSection />}
            {activeTab === 'evidence' && <EvidenceSection />}
            {activeTab === 'gallery' && <GallerySection />}
            {activeTab === 'activity' && <ActivityTimeline />}
            {activeTab === 'victims' && currentCampaign.hasVictims && <VictimsSection />}
            {activeTab === 'expert' && <ExpertHelpSection />}
            
            {/* Add other tab contents */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;