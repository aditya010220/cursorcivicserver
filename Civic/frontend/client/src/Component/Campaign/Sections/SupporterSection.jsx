import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../Context/authContext';
import { 
  FaUsers, FaUserCheck, FaHandsHelping, FaShareAlt, FaMoneyBill,
  FaCheck, FaExclamationCircle, FaSpinner
} from 'react-icons/fa';

const SupporterSection = ({ campaign }) => {
  const [isSupporting, setIsSupporting] = useState(false);
  const [supportDetails, setSupportDetails] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supporters, setSupporters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    supportType: 'signature',
    message: '',
    isAnonymous: false
  });
  
  useEffect(() => {
    if (campaign?._id) {
      fetchSupporters();
      if (currentUser) {
        checkUserSupport();
      }
    }
  }, [campaign?._id, currentUser]);
  
  const fetchSupporters = async () => {
    if (!campaign?._id) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/campaigns/${campaign._id}/supporters?limit=10`
      );
      
      if (response.data.success) {
        setSupporters(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching supporters:', err);
      setError('Failed to fetch supporters');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkUserSupport = async () => {
    if (!campaign?._id || !currentUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/campaigns/${campaign._id}/supporters/check`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setIsSupporting(response.data.isSupporting);
        setSupportDetails(response.data.supportDetails);
      }
    } catch (err) {
      console.error('Error checking support status:', err);
    }
  };
  
  const handleSupportCampaign = async () => {
    if (!currentUser) {
      // You can redirect to login page or show login modal
      alert('Please login to support this campaign');
      return;
    }
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/supporters`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setIsSupporting(true);
        setSupportDetails(response.data.data);
        setShowSupportModal(false);
        setSuccessMessage('Thank you for supporting this campaign!');
        
        // Refresh supporters list
        fetchSupporters();
        
        // Reset form
        setFormData({
          supportType: 'signature',
          message: '',
          isAnonymous: false
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (err) {
      console.error('Error supporting campaign:', err);
      setError(err.response?.data?.message || 'Failed to support campaign');
    }
  };
  
  const handleRemoveSupport = async () => {
    if (!currentUser || !isSupporting) return;
    
    if (!confirm('Are you sure you want to withdraw your support for this campaign?')) {
      return;
    }
    
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:4000/api/campaigns/${campaign._id}/supporters`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setIsSupporting(false);
        setSupportDetails(null);
        
        // Refresh supporters list
        fetchSupporters();
        
        setSuccessMessage('Your support has been withdrawn.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (err) {
      console.error('Error removing support:', err);
      setError(err.response?.data?.message || 'Failed to withdraw support');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Get icon based on support type
  const getSupportTypeIcon = (type) => {
    switch (type) {
      case 'signature': return <FaUserCheck />;
      case 'volunteer': return <FaHandsHelping />;
      case 'share': return <FaShareAlt />;
      case 'donation': return <FaMoneyBill />;
      case 'participation': return <FaUsers />;
      default: return <FaUserCheck />;
    }
  };
  
  // Get support type name
  const getSupportTypeName = (type) => {
    switch (type) {
      case 'signature': return 'Signed';
      case 'volunteer': return 'Volunteered';
      case 'share': return 'Shared';
      case 'donation': return 'Donated';
      case 'participation': return 'Participating';
      default: return 'Supported';
    }
  };
  
  // Calculate campaign metrics
  const totalSupporters = campaign?.engagementMetrics?.supporters || 0;
  const signatureCount = campaign?.engagementMetrics?.signatureCount || 0;
  const goalPercentage = campaign?.targetGoal === 'signatures' && campaign?.targetNumber
    ? Math.min(100, Math.round((signatureCount / campaign.targetNumber) * 100))
    : 0;
    
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Campaign Support</h2>
        
        {currentUser && !isSupporting ? (
          <button
            onClick={() => setShowSupportModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Support This Campaign
          </button>
        ) : currentUser && isSupporting ? (
          <div className="flex items-center">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center text-sm font-medium mr-3">
              <FaCheck className="mr-1" /> {getSupportTypeName(supportDetails?.supportType)}
            </span>
            <button
              onClick={handleRemoveSupport}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Withdraw Support
            </button>
          </div>
        ) : (
          <button
            onClick={() => alert('Please login to support this campaign')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Login to Support
          </button>
        )}
      </div>
      
      {/* Success or error message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 border-l-4 border-green-400 rounded-md">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-md">
          {error}
        </div>
      )}
      
      {/* Campaign stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-600">{totalSupporters}</div>
          <div className="text-sm text-gray-500">Total Supporters</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-600">{signatureCount}</div>
          <div className="text-sm text-gray-500">Signatures</div>
        </div>
        
        {campaign?.targetGoal === 'signatures' && campaign?.targetNumber && (
          <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-1 text-sm font-medium">
              <span>{goalPercentage}% Complete</span>
              <span>{signatureCount} / {campaign.targetNumber} Signatures</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${goalPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent supporters */}
      <div>
        <h3 className="font-medium text-lg mb-4">Recent Supporters</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-indigo-600" size={24} />
          </div>
        ) : supporters.length > 0 ? (
          <div className="space-y-3">
            {supporters.map((supporter, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  {getSupportTypeIcon(supporter.supportType)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {supporter.isAnonymous ? 'Anonymous Supporter' : supporter.user?.fullName || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <span>{getSupportTypeName(supporter.supportType)}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(supporter.supportedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {supporter.message && (
                    <p className="text-sm mt-1 text-gray-700">{supporter.message}</p>
                  )}
                </div>
              </div>
            ))}
            
            <div className="text-center mt-4">
              <button 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                onClick={fetchSupporters}
              >
                View All Supporters
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No supporters yet. Be the first!</p>
          </div>
        )}
      </div>
      
      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Support this Campaign</h3>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSupportCampaign();
            }}>
              {/* Support Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you like to support?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    formData.supportType === 'signature' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}>
                    <input 
                      type="radio"
                      name="supportType"
                      value="signature"
                      checked={formData.supportType === 'signature'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <FaUserCheck className={`mr-2 ${
                      formData.supportType === 'signature' ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <span>Sign</span>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    formData.supportType === 'volunteer' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}>
                    <input 
                      type="radio"
                      name="supportType"
                      value="volunteer"
                      checked={formData.supportType === 'volunteer'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <FaHandsHelping className={`mr-2 ${
                      formData.supportType === 'volunteer' ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <span>Volunteer</span>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    formData.supportType === 'share' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}>
                    <input 
                      type="radio"
                      name="supportType"
                      value="share"
                      checked={formData.supportType === 'share'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <FaShareAlt className={`mr-2 ${
                      formData.supportType === 'share' ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <span>Share</span>
                  </label>
                  
                  <label className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                    formData.supportType === 'participation' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}>
                    <input 
                      type="radio"
                      name="supportType"
                      value="participation"
                      checked={formData.supportType === 'participation'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <FaUsers className={`mr-2 ${
                      formData.supportType === 'participation' ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <span>Participate</span>
                  </label>
                </div>
              </div>
              
              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Share why you're supporting this campaign..."
                ></textarea>
              </div>
              
              {/* Anonymous option */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Support anonymously
                  </span>
                </label>
              </div>
              
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-md">
                  <div className="flex">
                    <FaExclamationCircle className="mt-1 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              {/* Submit button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Support Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupporterSection;