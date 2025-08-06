import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext';
import { useCampaign } from '../../Context/campaignContext';
import CustomLoading from '../Loading/CustomLoading';
import { FaMapMarkerAlt, FaVrCardboard, FaPoll } from 'react-icons/fa';  // Add this import for the poll icon
import StreetViewModal from './StreetViewModal';

// Import components
import BannerSection from './Sections/BannerSection';
import CampaignSidebar from './Sections/CampaignSidebar';
import MobileTabBar from './Sections/MobileTabBar';

// Import section components
import OverviewSection from './Sections/Overview';
import TeamSection from './Sections/TeamSection';
import EvidenceSection from './Sections/EvidenceSection';
import UpdatesSection from './Sections/UpdatesSection';
import ActivitySection from './Sections/ActivitySection';
import GallerySection from './Sections/GallerySection';
import VictimsSection from './Sections/VictimSection';
import ExpertHelpSection from './Sections/ExpertHelpSection';
import ManageSection from './Sections/ManageSection';
import SupporterSection from './Sections/SupporterSection';
import SignatureList from './Sections/SignatureList';
import PollsSection from './Sections/PollsSection';  // Add this import

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

  // Add Street View Modal state
  const [showStreetViewModal, setShowStreetViewModal] = useState(false);
  const [locationForVR, setLocationForVR] = useState('');

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
    // Check if we have both user and campaign data
    if (!currentUser) {
      console.log("Authorization failed: No current user");
      return false;
    }
    
    if (!currentCampaign) {
      console.log("Authorization failed: No current campaign");
      return false;
    }
    
    console.log("Checking authorization for:", {
      userId: currentUser.id,
      userEmail: currentUser.email,
      campaignCreator: currentCampaign.createdBy,
      campaignTeam: currentCampaign.team
    });
    
    // Check if user is creator
    if (currentCampaign.createdBy) {
      // Check both string and object ID comparison
      const creatorId = typeof currentCampaign.createdBy === 'object' 
        ? currentCampaign.createdBy._id 
        : currentCampaign.createdBy;
        
      if (creatorId === currentUser.id || creatorId === currentUser._id) {
        console.log("Authorization succeeded: User is campaign creator");
        return true;
      }
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
      
      const isTeamMember = allMembers.some(member => {
        if (!member) return false;
        
        // Check all possible ID formats
        const memberId = member.userId || member._id || member.id;
        const isMatch = memberId === currentUser.id || memberId === currentUser._id;
        
        if (isMatch) {
          console.log("Found matching team member:", member);
        }
        
        return isMatch;
      });
      
      if (isTeamMember) {
        console.log("Authorization succeeded: User is team member");
        return true;
      }
    }
    
    console.log("Authorization failed: User is not creator or team member");
    return false;
  };

  // Handle cover image edit
  const handleEditCover = () => {
    setShowCoverModal(true);
  };

  // Handle cover image update
  const handleCoverUpdated = (newCoverUrl) => {
    // Update the campaign in state with new cover URL
    if (currentCampaign) {
      const updatedCampaign = {
        ...currentCampaign,
        coverImage: newCoverUrl
      };
      // This would ideally update the state in your context
      console.log("Cover image updated:", newCoverUrl);
    }
  };

  // Handle opening Street View modal
  const handleVisualizeLocation = () => {
    // Determine the best location string to start with
    let initialLocation = '';
    
    if (currentCampaign.location) {
      if (typeof currentCampaign.location === 'object') {
        // Format object location
        const { city, state, country } = currentCampaign.location;
        initialLocation = [city, state, country].filter(Boolean).join(', ');
      } else {
        // String location
        initialLocation = currentCampaign.location;
      }
    } else if (currentCampaign.address) {
      initialLocation = currentCampaign.address;
    } else {
      initialLocation = `${currentCampaign.title} location`;
    }
    
    setLocationForVR(initialLocation);
    setShowStreetViewModal(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection campaign={currentCampaign} onVisualizeLocation={handleVisualizeLocation} />;
      case 'updates':
        return <UpdatesSection campaign={currentCampaign} formatDate={formatDate} />;
      case 'evidence':
        return <EvidenceSection campaign={currentCampaign} formatDate={formatDate} isUserAuthorized={isUserAuthorized()} />;
      case 'gallery':
        return <GallerySection campaign={currentCampaign} isUserAuthorized={isUserAuthorized()} />;
      case 'activity':
        return <ActivitySection campaign={currentCampaign} formatDate={formatDate} isUserAuthorized={isUserAuthorized()} />;
      case 'team':
        return <TeamSection campaign={currentCampaign} />;
      case 'victims':
        return currentCampaign.hasVictims ? 
          <VictimsSection campaign={currentCampaign} isUserAuthorized={isUserAuthorized()} /> : null;
      case 'supporters':
        return <SupporterSection campaign={currentCampaign} />;
      case 'signatures':
        return <SignatureList campaign={currentCampaign} />;
      case 'polls':
        return <PollsSection campaign={currentCampaign} isUserAuthorized={isUserAuthorized()} />;
      case 'expert':
        return <ExpertHelpSection />;
      case 'legal':
        return <div>Legal help resources</div>; // Replace with actual component
      case 'manage':
        return isUserAuthorized() ? <ManageSection campaign={currentCampaign} /> : null;
      case 'settings':
        return isUserAuthorized() ? <div>Campaign settings</div> : null; // Replace with actual component
      default:
        return <OverviewSection campaign={currentCampaign} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CustomLoading size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-2">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link to="/dashboard" className="flex items-center text-indigo-600 hover:text-indigo-800">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen ">
      {/* Street View Modal */}
      {showStreetViewModal && (
        <StreetViewModal
          location={locationForVR}
          isOpen={showStreetViewModal}
          onClose={() => setShowStreetViewModal(false)}
        />
      )}

      {/* Banner Section with Cover Image */}
      <BannerSection 
        campaign={currentCampaign} 
        formatDate={formatDate}
        isUserAuthorized={isUserAuthorized()}
        onEditCover={handleEditCover}
        onCoverUpdated={handleCoverUpdated}
      />

      {/* Mobile Tab Navigation */}
      <MobileTabBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        campaign={currentCampaign}
        isUserAuthorized={isUserAuthorized()}
      />

      {/* Main Content Area - Revised Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation - Now flush with left edge */}
        <CampaignSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          campaign={currentCampaign}
          isUserAuthorized={isUserAuthorized()}
        />

        {/* Main Content - Full width with proper padding */}
        <div className="flex-1 bg-gray-50 min-h-screen px-6 py-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;