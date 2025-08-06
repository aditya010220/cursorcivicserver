import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaign } from '../../Context/campaignContext';
import CustomLoading from '../Loading/CustomLoading';
import axios from 'axios'; // Make sure axios is imported

// Step components
import BasicInfoStep from './BasicInfoStep';
import TeamSetupStep from './TeamSetupStep';
import EvidenceStep from './EvidenceStep';
import VictimsStep from './VictimStep';
import ReviewStep from './ReviewStep';

const CampaignForm = () => {
  const navigate = useNavigate();
  const { createCampaign, updateCampaignStep, isLoading, error } = useCampaign();
  
  // Add formError state
  const [formError, setFormError] = useState(null);
  
  // Campaign data state - will be built up across steps
  const [campaignData, setCampaignData] = useState({
    // Step 1: Basic info
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    location: {
      type: 'local',
      city: '',
      state: '',
      country: ''
    },
    
    // Step 2: Team
    team: {
      coLeader: null,
      socialMediaCoordinator: null,
      volunteerCoordinator: null,
      financeManager: null,
      additionalMembers: []
    },
    
    // Step 3: Evidence
    evidence: [],
    
    // Step 4: Victims
    hasVictims: false,
    victims: []
  });
  
  // Track current step and campaign ID
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignId, setCampaignId] = useState(null);
  const [stepSubmitting, setStepSubmitting] = useState(false);
  
  // Add the fetchCampaign function
  const fetchCampaign = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setCampaignData(prev => ({
          ...prev,
          ...response.data.data
        }));
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
    }
  };
  
  // Function to handle basic info submission (Step 1)
  const handleBasicInfoSubmit = async (basicInfo) => {
    setStepSubmitting(true);
    setFormError(null); // Reset any previous errors
    
    try {
      // Update our form data
      setCampaignData(prev => ({
        ...prev,
        ...basicInfo
      }));
      
      if (!campaignId) {
        // First-time creation - create campaign and move to step 2
        console.log("Creating new campaign with basic info:", basicInfo);
        const result = await createCampaign(basicInfo);
        
        if (result && result._id) {
          console.log(`Campaign created with ID: ${result._id}, setting step to 2`);
          setCampaignId(result._id);
          
          // Important: After creating, manually set the step to 2 in both frontend and backend
          setCurrentStep(2);
          
          // Also update the backend to ensure it knows we're at step 2
          await updateCampaignStep(result._id, 1, basicInfo);
          
          // Optional: Fetch the updated campaign to ensure data consistency
          fetchCampaign(result._id);
        } else {
          throw new Error("Failed to get campaign ID from creation response");
        }
      } else {
        // Campaign already exists, just update it
        console.log(`Updating existing campaign ${campaignId} with basic info:`, basicInfo);
        await updateCampaignStep(campaignId, 1, basicInfo);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Error saving basic info:", error);
      setFormError("Failed to save campaign information. Please try again.");
    } finally {
      setStepSubmitting(false);
    }
  };
  
  // Function to handle team setup submission (Step 2)
  const handleTeamSubmit = async (teamData) => {
    setStepSubmitting(true);
    try {
      // Ensure communicationChannels.other is properly formatted
      const formattedTeamData = {
        ...teamData,
        communicationChannels: {
          ...teamData.communicationChannels,
          other: typeof teamData.communicationChannels?.other === 'string'
            ? [{ name: 'Other', url: teamData.communicationChannels.other }]
            : teamData.communicationChannels?.other || []
        }
      };
      
      // Update our form data state
      setCampaignData(prev => ({
        ...prev,
        team: formattedTeamData
      }));
      
      // First check if we're at step 1 and need to submit basic info first
      if (!campaignId) {
        // We need to create the campaign first with basic info
        const basicInfoResult = await createCampaign({
          title: campaignData.title,
          description: campaignData.description,
          shortDescription: campaignData.shortDescription,
          category: campaignData.category,
          tags: campaignData.tags,
          location: campaignData.location
        });
        
        setCampaignId(basicInfoResult._id);
        // Now update with team data
        await updateCampaignStep(basicInfoResult._id, 2, formattedTeamData);
      } else {
        // Update the campaign with team data
        await updateCampaignStep(campaignId, 2, formattedTeamData);
      }
      
      setCurrentStep(3);
    } catch (error) {
      console.error("Error saving team data:", error);
    } finally {
      setStepSubmitting(false);
    }
  };
  
  // Function to handle evidence submission (Step 3)
  const handleEvidenceSubmit = async (evidenceData) => {
    setStepSubmitting(true);
    try {
      // Update our form data state
      setCampaignData(prev => ({
        ...prev,
        evidence: evidenceData
      }));
      
      // We don't submit evidence here - it's handled via file uploads
      // Just move to next step for now
      setCurrentStep(4);
    } catch (error) {
      console.error("Error handling evidence:", error);
    } finally {
      setStepSubmitting(false);
    }
  };
  
  // Function to handle victims submission (Step 4)
  const handleVictimsSubmit = async (victimsData) => {
    setStepSubmitting(true);
    try {
      // Update our form data state
      setCampaignData(prev => ({
        ...prev,
        hasVictims: victimsData.hasVictims,
        victims: victimsData.victims || []
      }));
      
      // Update the campaign with victims data
      await updateCampaignStep(campaignId, 3, {
        hasVictims: victimsData.hasVictims,
        victims: victimsData.victims || []
      });
      
      setCurrentStep(5); // Move to review step
    } catch (error) {
      console.error("Error saving victims data:", error);
    } finally {
      setStepSubmitting(false);
    }
  };
  
  // Function to finalize the campaign
  const handleFinalize = async (options = {}) => {
    setStepSubmitting(true);
    try {
      // Final step - mark as complete and optionally publish
      await updateCampaignStep(campaignId, 4, {
        publishNow: options.publishNow || false,
        skipEvidenceRequirement: options.skipEvidence || false
      });
      
      // Redirect to campaign view or dashboard
      navigate(options.publishNow 
        ? `/campaigns/${campaignId}` 
        : '/dashboard/campaigns'
      );
      
    } catch (error) {
      console.error("Error finalizing campaign:", error);
    } finally {
      setStepSubmitting(false);
    }
  };

  // Render the appropriate step component
  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            initialData={campaignData}
            onSubmit={handleBasicInfoSubmit}
            isSubmitting={stepSubmitting}
          />
        );
      case 2:
        return (
          <TeamSetupStep
            initialData={campaignData.team}
            onSubmit={handleTeamSubmit}
            onBack={() => setCurrentStep(1)}
            isSubmitting={stepSubmitting}
          />
        );
      case 3:
        return (
          <EvidenceStep
            initialData={{
              evidence: campaignData.evidence
            }}
            campaignId={campaignId}
            onSubmit={handleEvidenceSubmit}
            onBack={() => setCurrentStep(2)}
            isSubmitting={stepSubmitting}
          />
        );
      case 4:
        return (
          <VictimsStep
            initialData={{
              hasVictims: campaignData.hasVictims,
              victims: campaignData.victims
            }}
            onSubmit={handleVictimsSubmit}
            onBack={() => setCurrentStep(3)}
            isSubmitting={stepSubmitting}
          />
        );
      case 5:
        return (
          <ReviewStep
            campaignData={campaignData}
            campaignId={campaignId}
            onFinalize={handleFinalize}
            onBack={() => setCurrentStep(4)}
            isSubmitting={stepSubmitting}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      {isLoading && <CustomLoading />}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Your Campaign</h2>
        
        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                Step {currentStep} of 5
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-indigo-600">
                {Math.round((currentStep / 5) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <div
              style={{ width: `${(currentStep / 5) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
            ></div>
          </div>
        </div>
        
        {/* Step titles */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <div className={currentStep >= 1 ? "text-indigo-600 font-semibold" : ""}>Basic Info</div>
          <div className={currentStep >= 2 ? "text-indigo-600 font-semibold" : ""}>Team</div>
          <div className={currentStep >= 3 ? "text-indigo-600 font-semibold" : ""}>Evidence</div>
          <div className={currentStep >= 4 ? "text-indigo-600 font-semibold" : ""}>Victims</div>
          <div className={currentStep >= 5 ? "text-indigo-600 font-semibold" : ""}>Review</div>
        </div>
      </div>
      
      {/* Error Display - show both contextual error and form error */}
      {(error || formError) && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
          {error || formError}
        </div>
      )}
      
      {/* Current Step Form */}
      {renderStepComponent()}
    </div>
  );
};

export default CampaignForm;