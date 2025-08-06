import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaEdit, 
  FaRegNewspaper, 
  FaUsers, 
  FaClipboardList, 
  FaPlus, 
  FaMapMarkerAlt,
  FaCalendarAlt, 
  FaHandsHelping, 
  FaClock, 
  FaCheckCircle,
  FaBullhorn,
  FaGavel,
  FaMedal,
  FaClock as FaClockSolid,
  FaMoneyBill,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaImages,
  FaLink,
  FaExclamationCircle,
  FaNewspaper
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../../Context/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import AddActivityModal from './AddActivityModal';

const ActivitySection = ({ campaign, formatDate, isUserAuthorized }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();
  
  const isAuthorized = typeof isUserAuthorized !== 'undefined' 
    ? isUserAuthorized 
    : Boolean(currentUser && campaign && (
      currentUser._id === campaign.createdBy?._id ||
      campaign.team?.some(member => member.user?._id === currentUser._id)
    ));

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'update',
    status: 'planned',
    scheduledDate: '',
    completedDate: '',
    location: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: {
        latitude: null,
        longitude: null
      },
      isVirtual: false
    },
    media: [],
    impact: {
      peopleImpacted: 0,
      resourcesUsed: '',
      costInvolved: 0,
      donationsReceived: 0,
      volunteerHours: 0,
      mediaReach: 0,
      outcomes: [],
      evidenceLinks: [],
      testimonials: [],
      customFields: {}
    },
    tags: [],
    participants: [],
    eventDetails: {
      startTime: '',
      endTime: '',
      maxParticipants: 0,
      requiresRegistration: false,
      isPublic: true
    },
    donationDetails: {
      amount: 0,
      currency: 'INR',
      donor: {
        name: '',
        isAnonymous: false
      },
      purpose: ''
    },
    mediaCoverage: {
      source: '',
      url: '',
      type: 'article',
      sentiment: 'neutral',
      reach: 0,
      highlights: []
    },
    milestoneDetails: {
      targetValue: 0,
      achievedValue: 0,
      metricType: '',
      isAchieved: false
    },
    visibility: {
      isPublic: true,
      showOnTimeline: true,
      showInReports: true,
      notifyFollowers: false
    }
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (campaign?._id) {
      fetchActivities();
    }
  }, [campaign]);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const fetchActivities = async () => {
    if (!campaign?._id) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/campaigns/${campaign._id}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setErrorMessage('Failed to load campaign activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prevState,
          [parent]: {
            ...prevState[parent],
            [child]: value
          }
        };
      }
      return {
        ...prevState,
        [name]: value
      };
    });
  }, []);

  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    
    setFormData(prevState => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prevState,
          [parent]: {
            ...prevState[parent],
            [child]: checked
          }
        };
      }
      return {
        ...prevState,
        [name]: checked
      };
    });
  }, []);

  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !formData.tags.includes(value)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, value]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'update',
      status: 'planned',
      scheduledDate: '',
      completedDate: '',
      location: {
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        coordinates: {
          latitude: null,
          longitude: null
        },
        isVirtual: false
      },
      media: [],
      impact: {
        peopleImpacted: 0,
        resourcesUsed: '',
        costInvolved: 0,
        donationsReceived: 0,
        volunteerHours: 0,
        mediaReach: 0,
        outcomes: [],
        evidenceLinks: [],
        testimonials: [],
        customFields: {}
      },
      tags: [],
      participants: [],
      eventDetails: {
        startTime: '',
        endTime: '',
        maxParticipants: 0,
        requiresRegistration: false,
        isPublic: true
      },
      donationDetails: {
        amount: 0,
        currency: 'INR',
        donor: {
          name: '',
          isAnonymous: false
        },
        purpose: ''
      },
      mediaCoverage: {
        source: '',
        url: '',
        type: 'article',
        sentiment: 'neutral',
        reach: 0,
        highlights: []
      },
      milestoneDetails: {
        targetValue: 0,
        achievedValue: 0,
        metricType: '',
        isAchieved: false
      },
      visibility: {
        isPublic: true,
        showOnTimeline: true,
        showInReports: true,
        notifyFollowers: false
      }
    });
    
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMessage("Title is required");
      return false;
    }
    
    if (!formData.description.trim()) {
      setErrorMessage("Description is required");
      return false;
    }
    
    if (formData.type === 'event' && !formData.scheduledDate) {
      setErrorMessage("Event date is required");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('status', formData.status);
      
      if (formData.scheduledDate) {
        submitData.append('scheduledDate', formData.scheduledDate);
      }
      
      if (formData.completedDate) {
        submitData.append('completedDate', formData.completedDate);
      }
      
      if (!formData.location.isVirtual) {
        if (formData.location.name) submitData.append('location.name', formData.location.name);
        if (formData.location.address) submitData.append('location.address', formData.location.address);
        if (formData.location.city) submitData.append('location.city', formData.location.city);
        if (formData.location.state) submitData.append('location.state', formData.location.state);
        if (formData.location.country) submitData.append('location.country', formData.location.country);
      }
      
      submitData.append('location.isVirtual', formData.location.isVirtual);
      
      if (formData.impact.peopleImpacted) {
        submitData.append('impact.peopleImpacted', formData.impact.peopleImpacted);
      }
      
      if (formData.impact.resourcesUsed) {
        submitData.append('impact.resourcesUsed', formData.impact.resourcesUsed);
      }
      
      if (formData.impact.costInvolved) {
        submitData.append('impact.costInvolved', formData.impact.costInvolved);
      }
      
      if (formData.impact.outcomes) {
        submitData.append('impact.outcomes', formData.impact.outcomes);
      }
      
      if (formData.tags.length > 0) {
        submitData.append('tags', JSON.stringify(formData.tags));
      }
      
      selectedFiles.forEach(file => {
        submitData.append('files', file);
      });
      
      const response = await axios.post(
        `http://localhost:4000/api/campaigns/${campaign._id}/activities`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Activity added successfully!');
        
        setActivities(prev => [response.data.data, ...prev]);
        
        setTimeout(() => {
          resetForm();
          setShowAddModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to add activity');
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'update':
        return <FaRegNewspaper className="text-blue-600" />;
      case 'event':
        return <FaCalendarAlt className="text-purple-600" />;
      case 'milestone':
        return <FaMedal className="text-yellow-600" />;
      case 'incident':
        return <FaExclamationCircle className="text-red-600" />;
      case 'donation':
        return <FaMoneyBill className="text-green-600" />;
      case 'protest':
        return <FaBullhorn className="text-orange-600" />;
      case 'meeting':
        return <FaUsers className="text-indigo-600" />;
      case 'media_coverage':
        return <FaNewspaper className="text-cyan-600" />;
      case 'policy_change':
        return <FaGavel className="text-teal-600" />;
      case 'legal_action':
        return <FaGavel className="text-rose-600" />;
      case 'volunteer_activity':
        return <FaHandsHelping className="text-emerald-600" />;
      case 'creation':
        return <FaEdit className="text-green-600" />;
      case 'team':
        return <FaUsers className="text-purple-600" />;
      case 'evidence':
        return <FaClipboardList className="text-blue-600" />;
      default:
        return <FaRegNewspaper className="text-gray-600" />;
    }
  };

  const constructTimeline = () => {
    const timeline = [...activities];
    
    if (campaign?.createdAt) {
      timeline.push({
        type: 'creation',
        createdAt: campaign.createdAt,
        title: 'Campaign Created',
        description: `${campaign.createdBy?.fullName || 'Someone'} created this campaign.`
      });
    }
    
    if (campaign?.evidence && campaign.evidence.length > 0) {
      campaign.evidence.forEach(evidence => {
        timeline.push({
          type: 'evidence',
          createdAt: evidence.createdAt,
          title: 'Evidence Added',
          description: `New evidence was added: "${evidence.title}"`,
          status: evidence.status
        });
      });
    }
    
    if (campaign?.updates && campaign.updates.length > 0) {
      campaign.updates.forEach(update => {
        timeline.push({
          type: 'update',
          createdAt: update.postedAt || update.createdAt,
          title: 'Campaign Update',
          description: update.title,
          content: update.content
        });
      });
    }
    
    if (campaign?.teamChanges && campaign.teamChanges.length > 0) {
      campaign.teamChanges.forEach(change => {
        timeline.push({
          type: 'team',
          createdAt: change.date,
          title: 'Team Change',
          description: change.description
        });
      });
    }
    
    return timeline.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredTimeline = () => {
    const allItems = constructTimeline();
    
    if (filter === 'all') {
      return allItems;
    }
    
    return allItems.filter(item => item.type === filter);
  };

  const activityTypes = [
    { value: 'update', label: 'General Update' },
    { value: 'event', label: 'Event' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'incident', label: 'Incident' },
    { value: 'donation', label: 'Donation/Fundraising' },
    { value: 'protest', label: 'Protest/Rally' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'media_coverage', label: 'Media Coverage' },
    { value: 'policy_change', label: 'Policy Change' },
    { value: 'legal_action', label: 'Legal Action' },
    { value: 'volunteer_activity', label: 'Volunteer Activity' }
  ];

  const statusOptions = [
    { value: 'planned', label: 'Planned' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Activities', icon: <FaClockSolid /> },
    { value: 'update', label: 'Updates', icon: <FaRegNewspaper /> },
    { value: 'event', label: 'Events', icon: <FaCalendarAlt /> },
    { value: 'milestone', label: 'Milestones', icon: <FaMedal /> },
    { value: 'evidence', label: 'Evidence', icon: <FaClipboardList /> },
    { value: 'team', label: 'Team Changes', icon: <FaUsers /> }
  ];

  const timeline = filteredTimeline();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Activity Timeline</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track key events and progress in this campaign
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <div className="relative">
            <button
              onClick={() => setFilterExpanded(!filterExpanded)}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium">Filter</span>
              {filterExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
            
            <AnimatePresence>
              {filterExpanded && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-2"
                >
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value);
                        setFilterExpanded(false);
                      }}
                      className={`flex items-center px-4 py-2 w-full text-left hover:bg-gray-50 ${
                        filter === option.value ? 'bg-gray-100 font-medium' : ''
                      }`}
                    >
                      <span className="w-6">{option.icon}</span>
                      <span className="ml-2">{option.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {isAuthorized && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 shadow-sm transition-colors"
            >
              <FaPlus className="mr-2" /> Add Activity
            </button>
          )}
        </div>
      </div>
      
      {filter !== 'all' && (
        <div className="bg-blue-50 px-4 py-2 rounded-lg mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-blue-700">
              Filtering by: {filterOptions.find(opt => opt.value === filter)?.label}
            </span>
          </div>
          <button 
            onClick={() => setFilter('all')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}
      
      {timeline.length > 0 ? (
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-5 md:left-7 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <motion.div 
                key={index} 
                className="relative pl-10 md:pl-14"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center bg-white rounded-full border-4 border-white z-10 shadow-md">
                  {getActivityIcon(item.type)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                  
                  {item.content && (
                    <div className="mt-2 text-sm bg-white p-3 rounded border border-gray-100">
                      {item.content.length > 150 
                        ? `${item.content.substring(0, 150)}...` 
                        : item.content}
                    </div>
                  )}
                  
                  {item.status && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        item.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'in-progress' ? 'bg-indigo-100 text-indigo-800' :
                        item.status === 'planned' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  
                  {item.location?.name && (
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>
                        {[
                          item.location.name,
                          item.location.city,
                          item.location.state,
                          item.location.country
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {item.media && item.media.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.media.map((mediaItem, mediaIndex) => (
                        <a 
                          key={mediaIndex}
                          href={mediaItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-100 rounded p-1 hover:bg-gray-200"
                        >
                          {mediaItem.type === 'image' ? (
                            <div className="w-16 h-16 relative">
                              <img 
                                src={mediaItem.url} 
                                alt={mediaItem.caption || 'Media'} 
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center">
                              <FaLink className="text-gray-500" />
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Activity Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {filter !== 'all' 
              ? `No ${filterOptions.find(opt => opt.value === filter)?.label.toLowerCase()} found for this campaign.`
              : "There's no activity history for this campaign yet. As the campaign progresses, activities will appear here."
            }
          </p>
          
          {isAuthorized && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 shadow-sm transition-colors"
            >
              <FaPlus className="mr-2" /> Add First Activity
            </button>
          )}
        </div>
      )}
      
      {showAddModal && (
        <AddActivityModal
          key="activity-modal"
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={() => setShowAddModal(false)}
          isLoading={isLoading}
          activityTypes={activityTypes}
          statusOptions={statusOptions}
        />
      )}
    </div>
  );
};

export default ActivitySection;