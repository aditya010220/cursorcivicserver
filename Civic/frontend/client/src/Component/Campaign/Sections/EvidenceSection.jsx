import React, { useState, useRef, useEffect } from 'react';
import { 
  FaSearch, FaFilter, FaFileUpload, FaImage, FaVideo, 
  FaFileAlt, FaMicrophone, FaQuoteRight, FaCheckCircle, 
  FaTimesCircle, FaExclamationCircle, FaHourglass,
  FaEye, FaDownload, FaPlus, FaSyncAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const EvidenceSection = ({ campaign, formatDate, isUserAuthorized }) => {
  // State management
  const [evidence, setEvidence] = useState(campaign?.evidence || []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form state with refs for focus management
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    evidenceType: 'photo',
    source: 'self_collected',
    testimonialContent: '',
    locationCollected: {
      city: '',
      state: '',
      country: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    documentDetails: {
      documentType: 'other',
      issuer: '',
      referenceNumber: '',
      numberOfPages: null
    },
    externalSource: {
      sourceName: '',
      sourceUrl: '',
      authorName: '',
      publicationDate: ''
    },
    permissions: {
      isPublic: true,
      restrictedTo: []
    }
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Add this helper function with your other const definitions
  const formatStatus = (status) => {
    return (status || 'pending').replace('_', ' ');
  };

  // Add function to fetch evidence
  const fetchEvidence = async () => {
    if (!campaign?._id) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4000/api/campaigns/${campaign._id}/evidence`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setEvidence(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch evidence when component mounts or campaign changes
  useEffect(() => {
    fetchEvidence();
  }, [campaign?._id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update the file selection handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Add file size validation
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('File size should not exceed 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Update handleSubmit to use fetchEvidence after successful upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();

      // Append file if not testimonial
      if (formData.evidenceType !== 'testimonial' && selectedFile) {
        formDataToSend.append('files', selectedFile);
      }

      // Append basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('evidenceType', formData.evidenceType);
      formDataToSend.append('source', formData.source);

      // Append location if provided
      if (formData.locationCollected.city || formData.locationCollected.country) {
        formDataToSend.append('locationCollected', JSON.stringify(formData.locationCollected));
      }

      // Append type-specific details
      if (formData.evidenceType === 'testimonial') {
        formDataToSend.append('testimonialContent', formData.testimonialContent);
      }

      if (formData.evidenceType === 'document') {
        formDataToSend.append('documentDetails', JSON.stringify(formData.documentDetails));
      }

      if (['news_article', 'social_media'].includes(formData.evidenceType)) {
        formDataToSend.append('externalSource', JSON.stringify(formData.externalSource));
      }

      // Append permissions
      formDataToSend.append('permissions', JSON.stringify(formData.permissions));

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/evidence`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      // Handle successful upload
      if (response.data.success) {
        await fetchEvidence(); // Fetch updated evidence list
        setShowUploadModal(false);
        resetForm();
      }

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error.response?.data?.message || 'Error uploading evidence');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      evidenceType: 'photo',
      source: 'self_collected',
      testimonialContent: '',
      locationCollected: {
        city: '',
        state: '',
        country: '',
        coordinates: {
          latitude: null,
          longitude: null
        }
      },
      documentDetails: {
        documentType: 'other',
        issuer: '',
        referenceNumber: '',
        numberOfPages: null
      },
      externalSource: {
        sourceName: '',
        sourceUrl: '',
        authorName: '',
        publicationDate: ''
      },
      permissions: {
        isPublic: true,
        restrictedTo: []
      }
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(0);
    setErrorMessage('');
  };

  const getAcceptedFileTypes = (type) => {
    switch (type) {
      case 'photo':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'audio':
        return 'audio/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      default:
        return '*/*';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Campaign Evidence</h2>
          <p className="text-sm text-gray-500">Manage and view evidence supporting your campaign</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchEvidence}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh evidence"
          >
            <FaSyncAlt className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {isUserAuthorized && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Add Evidence
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="all">All Types</option>
          <option value="photo">Photos</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="audio">Audio</option>
          <option value="testimonial">Testimonials</option>
        </select>
      </div>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidence
          .filter(item => filter === 'all' || item.evidenceType === filter)
          .filter(item => 
            search === '' || 
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              {item.mediaFile?.url && item.evidenceType === 'photo' && (
                <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={item.mediaFile.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.evidenceType === 'photo' ? 'bg-blue-100 text-blue-800' :
                    item.evidenceType === 'video' ? 'bg-purple-100 text-purple-800' :
                    item.evidenceType === 'document' ? 'bg-yellow-100 text-yellow-800' :
                    item.evidenceType === 'audio' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.evidenceType}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formatStatus(item.status)}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Source: {item.source}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Evidence</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  {/* Basic Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Evidence Type</label>
                      <select
                        name="evidenceType"
                        value={formData.evidenceType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      >
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="audio">Audio</option>
                        <option value="testimonial">Testimonial</option>
                        <option value="official_record">Official Record</option>
                        <option value="news_article">News Article</option>
                        <option value="social_media">Social Media</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      />
                    </div>

                    {/* Source Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                      >
                        <option value="victim">Victim</option>
                        <option value="witness">Witness</option>
                        <option value="official">Official</option>
                        <option value="media">Media</option>
                        <option value="investigation">Investigation</option>
                        <option value="self_collected">Self Collected</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          name="locationCollected.city"
                          value={formData.locationCollected.city}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          name="locationCollected.country"
                          value={formData.locationCollected.country}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Conditional Fields Based on Evidence Type */}
                    {formData.evidenceType === 'testimonial' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Testimonial Content</label>
                        <textarea
                          name="testimonialContent"
                          value={formData.testimonialContent}
                          onChange={handleInputChange}
                          rows={5}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          required
                        />
                      </div>
                    )}

                    {formData.evidenceType === 'document' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Document Type</label>
                          <select
                            name="documentDetails.documentType"
                            value={formData.documentDetails.documentType}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          >
                            <option value="official_report">Official Report</option>
                            <option value="court_document">Court Document</option>
                            <option value="medical_record">Medical Record</option>
                            <option value="police_report">Police Report</option>
                            <option value="scientific_study">Scientific Study</option>
                            <option value="contract">Contract</option>
                            <option value="correspondence">Correspondence</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Issuer</label>
                          <input
                            type="text"
                            name="documentDetails.issuer"
                            value={formData.documentDetails.issuer}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                          />
                        </div>
                      </div>
                    )}

                    {/* File Upload (for non-testimonial types) */}
                    {formData.evidenceType !== 'testimonial' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Upload File</label>
                        <input
                          type="file"
                          name="files"
                          onChange={handleFileSelect}
                          className="mt-1 block w-full"
                          accept={getAcceptedFileTypes(formData.evidenceType)}
                        />
                      </div>
                    )}

                    {/* Privacy Settings */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Privacy</label>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="permissions.isPublic"
                            checked={formData.permissions.isPublic}
                            onChange={(e) => setFormData({
                              ...formData,
                              permissions: { ...formData.permissions, isPublic: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="ml-2">Make this evidence public</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadProgress > 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                  >
                    {uploadProgress > 0 ? 'Uploading...' : 'Upload Evidence'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvidenceSection;