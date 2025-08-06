import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiAlertCircle, FiImage, FiFileText, FiVideo, FiMic, FiLink } from 'react-icons/fi';

const EvidenceStep = ({ initialData, onSubmit, onBack, isSubmitting, campaignId }) => {
  // State for evidence list
  const [evidence, setEvidence] = useState(initialData?.evidence || []);
  
  // Add a loading state for evidence
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState(null);
  
  // Form state variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceType, setEvidenceType] = useState('photo');
  const [evidenceSource, setEvidenceSource] = useState('victim');
  const [testimonialContent, setTestimonialContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Errors state
  const [errors, setErrors] = useState({});
  
  const fileInputRef = useRef(null);
  
  // Fetch evidence for this campaign when component mounts or campaignId changes
  useEffect(() => {
    const fetchEvidence = async () => {
      if (!campaignId) return;
      
      setIsLoadingEvidence(true);
      setEvidenceError(null);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4000/api/campaigns/${campaignId}/evidence`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          console.log('Fetched evidence:', response.data.data);
          setEvidence(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch evidence');
        }
      } catch (error) {
        console.error('Error fetching evidence:', error);
        setEvidenceError('Unable to load evidence. Please try refreshing the page.');
      } finally {
        setIsLoadingEvidence(false);
      }
    };
    
    fetchEvidence();
  }, [campaignId]);
  
  // Reset form function
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEvidenceType('photo');
    setEvidenceSource('victim');
    setTestimonialContent('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrors({});
  };
  
  // After successful upload, refresh the evidence list
  const refreshEvidence = async () => {
    if (!campaignId) return;
    
    try {
      setIsLoadingEvidence(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/campaigns/${campaignId}/evidence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        console.log('Refreshed evidence list:', response.data.data);
        setEvidence(response.data.data);
      }
    } catch (error) {
      console.error('Error refreshing evidence:', error);
    } finally {
      setIsLoadingEvidence(false);
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (evidenceType === 'testimonial' && !testimonialContent.trim()) {
      newErrors.testimonialContent = 'Testimonial content is required';
    }
    
    if (evidenceType !== 'testimonial' && selectedFiles.length === 0) {
      newErrors.file = `Please select a ${evidenceType} file to upload`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle final submit to move to next step
  const handleFinalSubmit = () => {
    // Only allow proceeding if at least one piece of evidence has been uploaded
    if (evidence.length === 0) {
      setErrors({ submit: 'Please add at least one piece of evidence before continuing' });
      return;
    }
    
    // Call the onSubmit function passed from parent
    onSubmit({ evidence });
  };

  // File preview component
  const FilePreview = ({ file, url, index }) => {
    const removeFile = () => {
      const newFiles = [...selectedFiles];
      const newUrls = [...previewUrls];
      
      // Revoke object URL to avoid memory leaks
      if (newUrls[index]) {
        URL.revokeObjectURL(newUrls[index]);
      }
      
      newFiles.splice(index, 1);
      newUrls.splice(index, 1);
      
      setSelectedFiles(newFiles);
      setPreviewUrls(newUrls);
    };
    
    return (
      <div className="relative border rounded-md overflow-hidden">
        {file.type.startsWith('image/') && url ? (
          <div className="w-24 h-24">
            <img src={url} alt={file.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
            <FiFile size={32} className="text-gray-400" />
          </div>
        )}
        
        <button
          type="button"
          onClick={removeFile}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <FiX size={14} />
        </button>
        
        <div className="px-2 py-1 bg-gray-100 text-xs truncate">
          {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
        </div>
      </div>
    );
  };

  // Evidence item component to display existing evidence
  const EvidenceItem = ({ item }) => {
    const getIcon = () => {
      switch (item.evidenceType) {
        case 'photo': return <FiImage className="text-blue-500" size={20} />;
        case 'video': return <FiVideo className="text-purple-500" size={20} />;
        case 'document': return <FiFileText className="text-amber-500" size={20} />;
        case 'audio': return <FiMic className="text-green-500" size={20} />;
        case 'testimonial': return <FiFileText className="text-orange-500" size={20} />;
        case 'news_article':
        case 'social_media': return <FiLink className="text-indigo-500" size={20} />;
        default: return <FiFile className="text-gray-500" size={20} />;
      }
    };
    
    return (
      <div className="flex items-center p-3 bg-white border rounded-md shadow-sm mb-2">
        <div className="mr-3 p-2 bg-gray-100 rounded-md">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{item.title}</h4>
          <p className="text-sm text-gray-500">
            {item.evidenceType.charAt(0).toUpperCase() + item.evidenceType.slice(1)} • 
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-2 px-2 py-1 rounded text-xs font-medium">
          {item.status === 'accepted' ? (
            <span className="text-green-600 flex items-center">
              <FiCheckCircle className="mr-1" /> Verified
            </span>
          ) : item.status === 'under_review' ? (
            <span className="text-amber-600 flex items-center">
              <FiAlertCircle className="mr-1" /> Under Review
            </span>
          ) : (
            <span className="text-gray-500 flex items-center">
              <FiAlertCircle className="mr-1" /> Pending
            </span>
          )}
        </div>
      </div>
    );
  };
  
  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Ensure campaignId is available
      if (!campaignId) {
        throw new Error('Campaign ID is missing. Cannot upload evidence.');
      }
      
      // Create FormData object for file uploads
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('evidenceType', evidenceType);
      formData.append('source', evidenceSource);
      formData.append('isPublic', isPublic);
      
      // For testimonials, add the content
      if (evidenceType === 'testimonial') {
        formData.append('testimonialContent', testimonialContent);
      } else {
        // For file uploads, append each file
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }
      }
      
      // Log the form data for debugging
      console.log(`Uploading evidence to campaign ${campaignId}`, {
        title,
        description,
        evidenceType,
        source: evidenceSource
      });
      
      // Make API call with Axios and track progress
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaignId}/evidence`,
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      console.log('Upload successful:', response.data);
      
      // Add the new evidence to the state immediately
      if (response.data.data) {
        // If data is an array, use it directly
        if (Array.isArray(response.data.data)) {
          setEvidence(prev => [...prev, ...response.data.data]);
        } else {
          // If it's a single object, add it to the array
          setEvidence(prev => [...prev, response.data.data]);
        }
      }
      
      // Also refresh from server to ensure consistency
      await refreshEvidence();
      
      // Reset form fields
      resetForm();
      
    } catch (error) {
      console.error('Evidence upload error:', error);
      setErrors({ 
        submit: error.response?.data?.message || error.message || 'Failed to upload evidence' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Evidence types options
  const evidenceTypes = [
    { value: 'photo', label: 'Photo' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'audio', label: 'Audio Recording' },
    { value: 'testimonial', label: 'Testimonial' },
    { value: 'news_article', label: 'News Article' },
    { value: 'social_media', label: 'Social Media Post' },
    { value: 'official_record', label: 'Official Record' }
  ];
  
  // Evidence sources options
  const evidenceSources = [
    { value: 'victim', label: 'Victim' },
    { value: 'witness', label: 'Witness' },
    { value: 'official', label: 'Official Source' },
    { value: 'media', label: 'Media Outlet' },
    { value: 'investigation', label: 'Independent Investigation' },
    { value: 'self_collected', label: 'Self-Collected' },
    { value: 'other', label: 'Other Source' }
  ];
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    
    // Create preview URLs for selected files
    const newPreviewUrls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null; // For non-image files
    });
    
    setPreviewUrls(newPreviewUrls);
    setErrors(prev => ({ ...prev, file: null }));
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Add Evidence to Your Campaign</h3>
      <p className="text-sm text-gray-600">
        Strong evidence helps your campaign gain credibility and support. Add photos, videos, documents, 
        or testimonials that demonstrate the issue you're addressing.
      </p>
      
      {/* Previously uploaded evidence */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="font-medium text-lg mb-3">Uploaded Evidence ({evidence.length})</h4>
        
        {isLoadingEvidence ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading evidence...</p>
          </div>
        ) : evidenceError ? (
          <div className="p-3 bg-red-50 text-red-700 rounded-md">
            {evidenceError}
          </div>
        ) : evidence.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No evidence has been uploaded yet. Use the form below to add evidence.
          </div>
        ) : (
          <div className="space-y-2">
            {evidence.map((item, index) => (
              <EvidenceItem key={item._id || index} item={item} />
            ))}
          </div>
        )}
      </div>
      
      {/* Upload form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6">
        <h4 className="font-medium mb-4">Add New Evidence</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Title input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Brief title describing this evidence"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          
          {/* Evidence type dropdown */}
          <div>
            <label htmlFor="evidenceType" className="block text-sm font-medium text-gray-700 mb-1">
              Type of Evidence *
            </label>
            <select
              id="evidenceType"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {evidenceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Description textarea */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Provide details about this evidence"
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        {/* Source dropdown */}
        <div className="mb-4">
          <label htmlFor="evidenceSource" className="block text-sm font-medium text-gray-700 mb-1">
            Source of Evidence *
          </label>
          <select
            id="evidenceSource"
            value={evidenceSource}
            onChange={(e) => setEvidenceSource(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {evidenceSources.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Testimonial content (shown only for testimonial type) */}
        {evidenceType === 'testimonial' && (
          <div className="mb-4">
            <label htmlFor="testimonialContent" className="block text-sm font-medium text-gray-700 mb-1">
              Testimonial Content *
            </label>
            <textarea
              id="testimonialContent"
              value={testimonialContent}
              onChange={(e) => setTestimonialContent(e.target.value)}
              rows={5}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.testimonialContent ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter the testimonial text..."
            ></textarea>
            {errors.testimonialContent && (
              <p className="mt-1 text-sm text-red-600">{errors.testimonialContent}</p>
            )}
          </div>
        )}
        
        {/* File upload (hidden for testimonial type) */}
        {evidenceType !== 'testimonial' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept={
                evidenceType === 'photo' ? 'image/*' :
                evidenceType === 'video' ? 'video/*' :
                evidenceType === 'document' ? '.pdf,.doc,.docx,.txt' :
                evidenceType === 'audio' ? 'audio/*' : '*'
              }
            />
            <div
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer ${
                errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <FiUpload className="text-gray-400 mb-2" size={24} />
              <p className="text-sm text-gray-600">
                Click to select {evidenceType === 'photo' ? 'a photo' : 
                   evidenceType === 'video' ? 'a video' :
                   evidenceType === 'document' ? 'a document' : 'a file'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {evidenceType === 'photo' ? 'JPG, PNG or GIF up to 10MB' :
                 evidenceType === 'video' ? 'MP4, MOV up to 10MB' :
                 evidenceType === 'document' ? 'PDF, DOC, TXT up to 10MB' :
                 evidenceType === 'audio' ? 'MP3, WAV up to 10MB' : 'Any file up to 10MB'}
              </p>
            </div>
            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
            
            {/* Preview selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Files:</p>
                <div className="flex flex-wrap gap-3">
                  {selectedFiles.map((file, index) => (
                    <FilePreview
                      key={index}
                      file={file}
                      url={previewUrls[index]}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Public/Private toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Make this evidence publicly visible
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            If unchecked, only campaign team members will be able to view this evidence.
          </p>
        </div>
        
        {/* Submit button */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isUploading}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading ({uploadProgress}%)
              </>
            ) : (
              'Upload Evidence'
            )}
          </button>
          
          {errors.submit && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </div>
      </form>
      
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
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? 'Saving...' : 'Continue to Next Step'}
        </button>
      </div>
    </div>
  );
};

EvidenceStep.propTypes = {
  initialData: PropTypes.shape({
    evidence: PropTypes.array
  }),
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  campaignId: PropTypes.string
};

export default EvidenceStep;