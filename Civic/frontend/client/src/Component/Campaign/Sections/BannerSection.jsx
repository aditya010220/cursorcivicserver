import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, 
  FaUser, FaSignature, FaShareAlt, FaCamera,
  FaUpload, FaRobot, FaTimes, FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../../../Context/authContext';
import { toast } from 'react-hot-toast';

const BannerSection = ({ campaign, formatDate, isUserAuthorized, onEditCover, onCoverUpdated }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [uploadTab, setUploadTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempCoverImage, setTempCoverImage] = useState(null);
  
  // Support modal states
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signFormData, setSignFormData] = useState({
    supportType: 'signature',
    message: '',
    isAnonymous: false
  });
  
  if (!campaign) return null;
  
  // Display either the temporary cover image (for instant feedback) or the actual campaign cover
  const displayCoverImage = tempCoverImage || campaign.coverImage;
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('coverImage', selectedFile);
      
      // Get token
      const token = localStorage.getItem('token');
      
      console.log('Form data ready for upload', {
        file: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
      
      // Instantly show the new image by setting it as temporary cover
      setTempCoverImage(previewUrl);
      
      // Close modal and reset form states, but keep tempCoverImage
      setShowModal(false);
      setSelectedFile(null);
      
      // Make the actual API request
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/cover-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Once the API responds successfully, clear the temp image and notify parent
      setTempCoverImage(null);
      setPreviewUrl(null);
      
      // Notify parent component that cover has been updated
      if (onCoverUpdated) {
        onCoverUpdated(response.data.coverImage);
      }
      
    } catch (err) {
      console.error('Error uploading image:', err);
      // If there's an error, revert back to original cover
      setTempCoverImage(null);
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateAI = async () => {
    if (!aiPrompt || aiPrompt.trim() === '') {
      setError('Please enter a description for your image');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // For now just log the prompt since backend isn't fully implemented
      console.log('AI Image generation prompt:', aiPrompt);
      
      // Reset states and close modal
      setShowModal(false);
      setAiPrompt('');
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.response?.data?.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the sign campaign modal
  const handleSignCampaign = () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      toast.error('Please login to support this campaign');
      navigate('/login');
      return;
    }

    setShowSignModal(true);
  };

  // Handle submitting the support form
  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    setIsSigningUp(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return;
      }
      
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/supporters`,
        signFormData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Thank you for supporting this campaign!');
        setShowSignModal(false);
        // You might want to refresh campaign data here or update UI
      }
    } catch (error) {
      console.error("Error supporting campaign:", error);
      const errorMessage = error.response?.data?.message || 'Failed to sign campaign';
      toast.error(errorMessage);
    } finally {
      setIsSigningUp(false);
    }
  };
  
  return (
    <div className="relative">
      <div className="h-[35vh] text-white relative overflow-hidden">
        {/* Background image and effects */}
        {displayCoverImage ? (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 z-10"></div>
            <img 
              src={displayCoverImage} 
              alt={campaign.title} 
              className="w-full h-full object-cover contrast-110 brightness-95"
            />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
                mixBlendMode: 'multiply'
              }}
            ></div>
          </div>
        ) : null}

        {/* Main content */}
        <div className="relative z-20 h-full flex flex-col">
          {/* Top bar with navigation and action buttons */}
          <div className="w-full px-6 py-4 flex justify-between items-center">
            <Link 
              to="/dashboard" 
              className="text-white/90 hover:text-white flex items-center transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back
            </Link>

            {/* Action buttons moved to top right */}
            <div className="flex items-center gap-4">
              {/* Edit Cover button was here - now moved */}
              <div className="bg-black/30 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
                <div className="text-xl font-bold">{campaign.engagementMetrics?.supporters || 0}</div>
                <div className="text-xs text-white/70 uppercase tracking-wider">Supporters</div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSignCampaign}
                  className="bg-white/90 hover:bg-white text-black px-4 py-2 rounded-full shadow-lg flex items-center justify-center font-medium transition-all"
                >
                  <FaSignature className="mr-2" /> Sign Now
                </button>
                <button className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full shadow-lg transition-all backdrop-blur-sm">
                  <FaShareAlt size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Campaign info moved to bottom */}
          <div className="mt-auto px-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20 uppercase tracking-wider mb-4">
                {campaign.category?.replace(/-/g, ' ')}
              </span>
              
              <h1 className="text-5xl font-bold mb-3 font-serif tracking-tight leading-tight">
                {campaign.title}
              </h1>
              
              <p className="text-xl text-white/90 mb-6 font-serif leading-relaxed max-w-3xl">
                {campaign.shortDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5">
                  <FaCalendarAlt className="mr-2" />
                  <span>Started {formatDate(campaign.createdAt)}</span>
                </div>

                {campaign.location && (
                  <div className="flex items-center backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>
                      {[
                        campaign.location.city,
                        campaign.location.state,
                        campaign.location.country
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {campaign.createdBy && (
                  <div className="flex items-center backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5">
                    <FaUser className="mr-2" />
                    <span>By {campaign.createdBy.fullName || "Anonymous"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-serif">Campaign Cover Image</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setAiPrompt('');
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  uploadTab === 'upload'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                } font-serif`}
                onClick={() => setUploadTab('upload')}
              >
                <FaUpload className="inline mr-2" /> Upload Image
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  uploadTab === 'ai'
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-gray-700'
                } font-serif`}
                onClick={() => setUploadTab('ai')}
              >
                <FaRobot className="inline mr-2" /> Generate with AI
              </button>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm font-serif">
                {error}
              </div>
            )}
            
            {/* Upload Image Tab - with black and white preview */}
            {uploadTab === 'upload' && (
              <div>
                {previewUrl ? (
                  <div className="mb-4">
                    <div className="relative aspect-w-5 aspect-h-2 rounded-md overflow-hidden">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full object-cover filter grayscale contrast-125"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center font-serif">
                      Preview shown with newspaper black & white effect
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                      Upload Cover Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center">
                        <FaUpload className="text-gray-400 text-3xl mb-2" />
                        <span className="text-gray-500 mb-1 font-serif">Click to upload or drag and drop</span>
                        <span className="text-xs text-gray-400 font-serif">PNG, JPG, WebP, GIF up to 5MB</span>
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-serif"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-serif"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" /> Uploading...
                      </>
                    ) : (
                      'Upload Image'
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Generate with AI Tab */}
            {uploadTab === 'ai' && (
              <div>
                <div className="mb-4">
                  <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                    Describe the cover image you want
                  </label>
                  <textarea
                    id="ai-prompt"
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., A dramatic black and white photo of protesters with signs, newspaper style, high contrast, dramatic lighting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-serif"
                  />
                  <p className="mt-1 text-xs text-gray-500 font-serif">
                    For best results with the newspaper theme, request black & white images with high contrast and dramatic lighting.
                  </p>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-serif"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={!aiPrompt.trim() || isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-serif"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <FaRobot className="inline mr-2" /> Generate Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign Campaign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-serif">Support Campaign</h3>
              <button 
                onClick={() => setShowSignModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmitSupport}>
              <div className="mb-4">
                <label htmlFor="support-type" className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                  Support Type
                </label>
                <select
                  id="support-type"
                  value={signFormData.supportType}
                  onChange={(e) => setSignFormData({ ...signFormData, supportType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-serif"
                >
                  <option value="signature">Signature</option>
                  <option value="donation">Donation</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={signFormData.message}
                  onChange={(e) => setSignFormData({ ...signFormData, message: e.target.value })}
                  placeholder="Write a message to show your support"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black font-serif"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={signFormData.isAnonymous}
                  onChange={(e) => setSignFormData({ ...signFormData, isAnonymous: e.target.checked })}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700 font-serif">
                  Support anonymously
                </label>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowSignModal(false)}
                  className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-serif"
                  disabled={isSigningUp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 font-serif"
                >
                  {isSigningUp ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Support'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection;