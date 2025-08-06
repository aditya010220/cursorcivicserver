import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const ReviewStep = ({ campaignData, onFinalize, onBack, isSubmitting, campaignId }) => {
  const [publishNow, setPublishNow] = useState(true);
  const [skipEvidence, setSkipEvidence] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [evidence, setEvidence] = useState(campaignData.evidence || []);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  
  // Fetch evidence if not provided in campaignData
  useEffect(() => {
    const fetchEvidence = async () => {
      if (!campaignId || (campaignData.evidence && campaignData.evidence.length > 0)) {
        return;
      }
      
      setIsLoadingEvidence(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4000/api/campaigns/${campaignId}/evidence`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          console.log('Fetched evidence for review:', response.data.data);
          setEvidence(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching evidence for review:', error);
      } finally {
        setIsLoadingEvidence(false);
      }
    };
    
    fetchEvidence();
  }, [campaignId, campaignData.evidence]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle campaign finalization
  const handleFinalize = () => {
    onFinalize({
      publishNow,
      skipEvidence
    });
  };

  // Check if there's evidence
  const hasEvidence = evidence && evidence.length > 0;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Review Campaign</h3>
      <p className="text-sm text-gray-600">
        Please review all information before finalizing your campaign.
      </p>

      {/* Basic Information Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-lg">Basic Information</h4>
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800"
            onClick={() => window.history.pushState(null, null, '#/step-1')}
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Title</p>
            <p>{campaignData.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="capitalize">{campaignData.category?.replace(/-/g, ' ')}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Short Description</p>
            <p>{campaignData.shortDescription}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Full Description</p>
            <p className="whitespace-pre-wrap">{campaignData.description}</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-lg">Team</h4>
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800"
            onClick={() => window.history.pushState(null, null, '#/step-2')}
          >
            Edit
          </button>
        </div>
        {/* Team information rendering */}
        <p>You are the campaign leader.</p>
        {/* Add more team information here */}
      </div>

      {/* Evidence Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-lg">Evidence</h4>
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800"
            onClick={() => window.history.pushState(null, null, '#/step-3')}
          >
            Edit
          </button>
        </div>
        
        {isLoadingEvidence ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading evidence...</p>
          </div>
        ) : hasEvidence ? (
          <div>
            <p className="mb-2">{evidence.length} piece(s) of evidence uploaded:</p>
            <ul className="list-disc pl-5 space-y-1">
              {evidence.map((item, index) => (
                <li key={item._id || index} className="text-sm">
                  <span className="font-medium">{item.title}</span> - 
                  <span className="text-gray-600 capitalize"> {item.evidenceType}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No evidence has been uploaded. Evidence helps strengthen your campaign.
                </p>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-indigo-600"
                      checked={skipEvidence}
                      onChange={(e) => setSkipEvidence(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">I understand and want to proceed without evidence</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Victims Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-lg">Victims</h4>
          <button 
            className="text-sm text-indigo-600 hover:text-indigo-800"
            onClick={() => window.history.pushState(null, null, '#/step-4')}
          >
            Edit
          </button>
        </div>
        
        {campaignData.hasVictims && campaignData.victims && campaignData.victims.length > 0 ? (
          <div>
            <p className="mb-2">{campaignData.victims.length} victim(s) added:</p>
            <ul className="list-disc pl-5 space-y-1">
              {campaignData.victims.map((victim, index) => (
                <li key={victim._id || index} className="text-sm">
                  {victim.privacyLevel === 'public' ? victim.name : 'Anonymous Victim'}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">No victims have been added to this campaign.</p>
        )}
      </div>

      {/* Publication options */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-lg mb-3">Publication Options</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={publishNow}
              onChange={() => setPublishNow(true)}
            />
            <span className="ml-2 text-sm text-gray-700">
              Publish campaign immediately
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={!publishNow}
              onChange={() => setPublishNow(false)}
            />
            <span className="ml-2 text-sm text-gray-700">
              Save as draft (publish later)
            </span>
          </label>
        </div>
      </div>

      {/* Confirmation checkbox */}
      <div className="border-t pt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={confirmPublish}
            onChange={(e) => setConfirmPublish(e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700">
            I confirm that all information provided is accurate and I have permission to share it.
          </span>
        </label>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleFinalize}
          disabled={isSubmitting || (!hasEvidence && !skipEvidence) || !confirmPublish}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting || (!hasEvidence && !skipEvidence) || !confirmPublish
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Finalizing...' : (publishNow ? 'Publish Campaign' : 'Save Draft')}
        </button>
      </div>
    </div>
  );
};

ReviewStep.propTypes = {
  campaignData: PropTypes.object.isRequired,
  onFinalize: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  campaignId: PropTypes.string
};

export default ReviewStep;