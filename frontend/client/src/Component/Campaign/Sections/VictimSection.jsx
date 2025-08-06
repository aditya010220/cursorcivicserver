import React, { useState, useEffect, useRef } from 'react';
import { 
  FaUserShield, FaUser, FaShieldAlt, FaEnvelope, FaPhone, 
  FaHandHoldingHeart, FaPlus, FaTimes, FaCheck, FaExclamationCircle,
  FaUpload, FaImage, FaTrash
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../../Context/authContext';

const VictimsSection = ({ campaign, isUserAuthorized }) => {
  // State management
  const [victims, setVictims] = useState([]);
  const [activeVictimId, setActiveVictimId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    relationshipToCampaign: '',
    impactDescription: '',
    hasConsented: false,
    privacyLevel: 'anonymous',
    contactInformation: {
      email: '',
      phone: '',
      address: '',
      isPublic: false
    }
  });

  // Add campaign ID validation
  useEffect(() => {
    console.log('Campaign prop:', campaign);
    console.log('Campaign ID:', campaign?._id);
    
    if (!campaign?._id) {
      console.error('No campaign ID available');
      return;
    }

    fetchVictims();
  }, [campaign?._id]);

  // Fetch victims from API
  const fetchVictims = async () => {
    if (!campaign?._id) {
      console.error('No campaign ID available');
      setError('Campaign ID is missing');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      console.log(`Making request to: http://localhost:4000/api/campaigns/${campaign._id}/victims`);
      
      const response = await axios.get(
        `http://localhost:4000/api/campaigns/${campaign._id}/victims`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Victims response:', response.data);

      if (response.data.success) {
        setVictims(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch victims');
      }
    } catch (error) {
      console.error('Error fetching victims:', error);
      setError(error.response?.data?.message || 'Error fetching victims');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Helper function to check permissions
  const canManageVictims = () => {
    return isUserAuthorized;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!canManageVictims()) {
      setError('You do not have permission to add victim information');
      return;
    }

    if (!campaign?._id) {
      setError('Campaign ID is missing');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && key !== 'contactInformation') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append contact information as a JSON string
      formDataToSend.append('contactInformation', JSON.stringify(formData.contactInformation));
      
      // Append the image if one is selected
      if (selectedImage) {
        formDataToSend.append('victimImage', selectedImage);
      }

      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/victims`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        await fetchVictims();
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding victim:', error);
      setError(error.response?.data?.message || 'Error adding victim');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: '',
      relationshipToCampaign: '',
      impactDescription: '',
      hasConsented: false,
      privacyLevel: 'anonymous',
      contactInformation: {
        email: '',
        phone: '',
        address: '',
        isPublic: false
      }
    });
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle edit victim
  const handleEditVictim = (victim) => {
    setFormData({
      name: victim.name || '',
      age: victim.age || '',
      gender: victim.gender || '',
      relationshipToCampaign: victim.relationshipToCampaign || '',
      impactDescription: victim.impactDescription || '',
      hasConsented: victim.hasConsented || false,
      privacyLevel: victim.privacyLevel || 'anonymous',
      contactInformation: {
        email: victim.contactInformation?.email || '',
        phone: victim.contactInformation?.phone || '',
        address: victim.contactInformation?.address || '',
        isPublic: victim.contactInformation?.isPublic || false
      }
    });
    
    if (victim.picture) {
      setImagePreview(victim.picture);
    }
    
    setShowAddModal(true);
  };

  // Handle delete victim
  const handleDeleteVictim = async (victimId) => {
    if (!window.confirm("Are you sure you want to delete this victim's information?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:4000/api/campaigns/${campaign._id}/victims/${victimId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      await fetchVictims();
    } catch (error) {
      console.error('Error deleting victim:', error);
      setError(error.response?.data?.message || 'Error deleting victim');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <FaUserShield className="text-red-600" size={20} />
          </div>
          <h2 className="text-xl font-semibold">Campaign Victims</h2>
        </div>

        {/* Add Victim Button - Show only if user is authorized */}
        {isUserAuthorized && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <FaPlus className="mr-2" /> Add Victim
          </button>
        )}
      </div>

      {/* Important Notice */}
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
        <p className="text-yellow-800 text-sm">
          <strong>Important:</strong> Information shared here is presented with the consent of the victims or their representatives. 
          Some details may be anonymized for privacy and safety reasons.
        </p>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Victims Grid */}
      {victims.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {victims.map((victim) => (
            <VictimCard 
              key={victim._id}
              victim={victim}
              isUserAuthorized={isUserAuthorized}
              onEdit={() => handleEditVictim(victim)}
              onDelete={() => handleDeleteVictim(victim._id)}
              onView={() => setActiveVictimId(victim._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaShieldAlt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Victim Information</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There is no victim information associated with this campaign yet.
          </p>
        </div>
      )}

      {/* Add Victim Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Victim Information</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Victim Photo (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button 
                          type="button"
                          onClick={removeSelectedImage}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUser className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaUpload className="mr-2" />
                      {imagePreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG or GIF up to 5MB. Photos will be shown according to privacy settings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>

              {/* Gender and Relationship */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship to Campaign
                  </label>
                  <select
                    name="relationshipToCampaign"
                    value={formData.relationshipToCampaign}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select Relationship</option>
                    <option value="direct-victim">Direct Victim</option>
                    <option value="family-member">Family Member</option>
                    <option value="witness">Witness</option>
                    <option value="community-member">Community Member</option>
                    <option value="advocate">Advocate</option>
                  </select>
                </div>
              </div>

              {/* Impact Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact Description
                </label>
                <textarea
                  name="impactDescription"
                  value={formData.impactDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                ></textarea>
              </div>

              {/* Privacy Settings */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Privacy Level
                </label>
                <select
                  name="privacyLevel"
                  value={formData.privacyLevel}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                >
                  <option value="public">Public - Full name can be displayed</option>
                  <option value="anonymous">Anonymous - Identity will be protected</option>
                  <option value="private">Private - Information only for campaign organizers</option>
                </select>
              </div>

              {/* Consent Checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasConsented"
                    checked={formData.hasConsented}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I confirm that I have explicit consent to share this information
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Add Victim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Victim Details Modal */}
      {activeVictimId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <VictimDetails 
              victim={victims.find(v => v._id === activeVictimId)} 
              onClose={() => setActiveVictimId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Victim Card Component
const VictimCard = ({ victim, isUserAuthorized, onEdit, onDelete, onView }) => {
  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="relative">
        <div className="h-36 bg-gray-100 flex items-center justify-center">
          {victim.picture ? (
            <img 
              src={victim.picture} 
              alt={victim.privacyLevel === 'public' ? victim.name : 'Anonymous victim'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <FaUser size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                {victim.privacyLevel === 'public' ? 'No Image Available' : 'Anonymous'}
              </p>
            </div>
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            victim.privacyLevel === 'public' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {victim.privacyLevel === 'public' ? 'Public' : 'Anonymous'}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">
          {victim.privacyLevel === 'public' ? victim.name : `Anonymous Victim ${victim.anonymousIdentifier}`}
        </h3>
        
        {victim.relationshipToCampaign && (
          <p className="text-gray-500 text-sm mb-3">
            {victim.relationshipToCampaign.replace('-', ' ')}
          </p>
        )}
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {victim.impactDescription}
        </p>
      </div>
      
      {isUserAuthorized && (
        <div className="px-4 py-3 bg-gray-50 border-t flex justify-end space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Victim Details Component
const VictimDetails = ({ victim, onClose }) => {
  if (!victim) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Victim Details</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimes />
        </button>
      </div>

      {/* Victim image */}
      {victim.picture && (
        <div className="mb-4 flex justify-center">
          <img 
            src={victim.picture} 
            alt={victim.privacyLevel === 'public' ? victim.name : 'Anonymous victim'} 
            className="max-h-64 object-contain rounded-lg border"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Name</h4>
          <p className="mt-1">
            {victim.privacyLevel === 'public' ? victim.name : `Anonymous (${victim.anonymousIdentifier})`}
          </p>
        </div>

        {victim.age && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Age</h4>
            <p className="mt-1">{victim.age}</p>
          </div>
        )}

        {victim.gender && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Gender</h4>
            <p className="mt-1 capitalize">{victim.gender}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-500">Relationship to Campaign</h4>
          <p className="mt-1 capitalize">{victim.relationshipToCampaign.replace('-', ' ')}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Impact Description</h4>
          <p className="mt-1">{victim.impactDescription}</p>
        </div>

        {victim.privacyLevel === 'public' && victim.contactInformation?.isPublic && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
            <div className="mt-1 space-y-2">
              {victim.contactInformation.email && (
                <p className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  {victim.contactInformation.email}
                </p>
              )}
              {victim.contactInformation.phone && (
                <p className="flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  {victim.contactInformation.phone}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VictimsSection;