import React, { useState, useEffect } from 'react';
import { FaPoll, FaCheck, FaSpinner, FaPlus, FaChartPie } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../../Context/authContext';
import { toast } from 'react-hot-toast';

const PollsSection = ({ campaign, isUserAuthorized }) => {
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showResults, setShowResults] = useState(false);
  console.log(campaign, isUserAuthorized);
  const { currentUser } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  
  // Fetch polls when component mounts
  useEffect(() => {
    if (campaign?._id) {
      fetchPolls();
    }
  }, [campaign?._id]);
  
  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/campaigns/${campaign._id}/polls`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setPolls(response.data.data);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVote = async (pollId, optionIndex) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to vote');
        return;
      }
      
      await axios.post(
        `${API_URL}/campaigns/${campaign._id}/polls/${pollId}/vote`,
        { optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Vote recorded successfully!');
      
      // Refresh polls to show updated results
      fetchPolls();
      
      // Show results after voting
      setShowResults(true);
      
    } catch (err) {
      console.error('Error voting:', err);
      toast.error(err.response?.data?.error || 'Error recording vote');
    }
  };
  
  const handleCreatePoll = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to create polls');
        return;
      }
      
      console.log("Creating poll with token:", token ? "Token exists" : "No token");
      console.log("User authorized:", isUserAuthorized);
      console.log("Current user:", currentUser);
      
      const response = await axios.post(
        `${API_URL}/campaigns/${campaign._id}/polls`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("Poll creation response:", response.data);
      toast.success('Poll created successfully!');
      setShowCreateModal(false);
      fetchPolls();
      
    } catch (err) {
      console.error('Error creating poll:', err);
      // More detailed error logging
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status code:', err.response.status);
        toast.error(err.response.data.error || 'Server error creating poll');
      } else if (err.request) {
        console.error('No response received:', err.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Error setting up request: ' + err.message);
      }
    }
  };
  
  const handleTogglePollStatus = async (pollId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${API_URL}/campaigns/${campaign._id}/polls/${pollId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Poll ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchPolls();
      
    } catch (err) {
      console.error('Error updating poll status:', err);
      toast.error(err.response?.data?.error || 'Error updating poll status');
    }
  };

  // Render poll list or details
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaPoll className="text-indigo-600" />
          Campaign Polls
        </h2>
        
        {isUserAuthorized && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <FaPlus size={14} />
            Create Poll
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <FaSpinner className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-600">
          <p>{error}</p>
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <FaPoll className="text-gray-400 mx-auto mb-3" size={32} />
          <p className="text-gray-500 mb-2">No polls have been created for this campaign yet.</p>
          {isUserAuthorized && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Create the first poll
            </button>
          )}
        </div>
      ) : selectedPoll ? (
        <PollDetail 
          poll={selectedPoll} 
          onBack={() => setSelectedPoll(null)}
          onVote={handleVote}
          showResults={showResults}
          setShowResults={setShowResults}
          isUserAuthorized={isUserAuthorized}
          onToggleStatus={handleTogglePollStatus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map(poll => (
            <PollCard
              key={poll._id}
              poll={poll}
              onClick={() => {
                setSelectedPoll(poll);
                setShowResults(poll.hasVoted);
              }}
            />
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePoll}
        />
      )}
    </div>
  );
};

// Poll Card Component
const PollCard = ({ poll, onClick }) => {
  const getStatusBadge = () => {
    if (!poll.isActive) {
      return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Inactive</span>;
    }
    
    const now = new Date();
    const endTime = new Date(poll.endTime);
    
    if (now > endTime) {
      return <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Ended</span>;
    }
    
    return <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Active</span>;
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{poll.title}</h3>
        {getStatusBadge()}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {poll.description || "No description provided."}
      </p>
      
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
        </span>
        <span>
          Ends {formatDate(poll.endTime)}
        </span>
      </div>
    </div>
  );
};

// Poll Detail Component
const PollDetail = ({ poll, onBack, onVote, showResults, setShowResults, isUserAuthorized, onToggleStatus }) => {
  const [selectedOption, setSelectedOption] = useState(poll.userVote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if poll has ended
  const isPollEnded = new Date() > new Date(poll.endTime);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get percentage for an option
  const getPercentage = (optionIndex) => {
    if (!poll.totalVotes) return 0;
    
    const voteCount = poll.voteCounts.find(vc => vc.optionIndex === optionIndex)?.count || 0;
    return Math.round((voteCount / poll.totalVotes) * 100);
  };
  
  const handleSubmitVote = async () => {
    if (selectedOption === null) return;
    
    setIsSubmitting(true);
    await onVote(poll._id, selectedOption);
    setIsSubmitting(false);
  };
  
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-indigo-600 flex items-center gap-1 hover:text-indigo-800"
      >
        ← Back to polls
      </button>
      
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{poll.title}</h3>
          
          {isUserAuthorized && (
            <button
              onClick={() => onToggleStatus(poll._id, !poll.isActive)}
              className={`px-3 py-1 rounded text-sm ${
                poll.isActive 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              {poll.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
        
        {poll.description && (
          <p className="text-gray-700 mt-2">{poll.description}</p>
        )}
        
        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <span>Created {formatDate(poll.createdAt)}</span>
          <span>Ends {formatDate(poll.endTime)}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">
            {showResults ? 'Results' : 'Options'}
          </h4>
          
          {(poll.hasVoted || isPollEnded) && (
            <button
              onClick={() => setShowResults(!showResults)}
              className="text-sm text-indigo-600"
            >
              {showResults ? 'Hide results' : 'Show results'}
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {poll.options.map((option) => (
            <div key={option.index} className="relative">
              {showResults ? (
                // Results view
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-gray-600">
                      {getPercentage(option.index)}% ({
                        poll.voteCounts.find(vc => vc.optionIndex === option.index)?.count || 0
                      })
                    </span>
                  </div>
                  
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${getPercentage(option.index)}%` }}
                    />
                  </div>
                  
                  {poll.userVote === option.index && (
                    <span className="absolute right-2 top-2 text-green-600">
                      <FaCheck />
                    </span>
                  )}
                </div>
              ) : (
                // Voting view
                <label
                  htmlFor={`option-${option.index}`}
                  className={`block border rounded-lg p-3 cursor-pointer 
                    ${selectedOption === option.index ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    id={`option-${option.index}`}
                    name="pollOption"
                    value={option.index}
                    checked={selectedOption === option.index}
                    onChange={() => setSelectedOption(option.index)}
                    className="hidden"
                    disabled={poll.hasVoted || isPollEnded || !poll.isActive}
                  />
                  <span>{option.text}</span>
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {!showResults && !poll.hasVoted && !isPollEnded && poll.isActive && (
        <button
          onClick={handleSubmitVote}
          disabled={selectedOption === null || isSubmitting}
          className="bg-indigo-600 text-white w-full py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      )}
      
      {(poll.hasVoted || isPollEnded || !poll.isActive) && !showResults && (
        <div className="text-center py-3 bg-gray-50 rounded-md">
          {poll.hasVoted ? (
            <p className="text-gray-700">You have already voted in this poll.</p>
          ) : !poll.isActive ? (
            <p className="text-gray-700">This poll is currently inactive.</p>
          ) : (
            <p className="text-gray-700">This poll has ended.</p>
          )}
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
          {poll.hasVoted && ' • You voted'}
        </p>
      </div>
    </div>
  );
};

// Create Poll Modal
const CreatePollModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    durationInDays: 7,
    isPublic: true
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };
  
  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.options.some(option => !option.trim())) {
      newErrors.options = 'All options must have content';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty options
      const filteredOptions = formData.options.filter(option => option.trim() !== '');
      
      await onSubmit({
        ...formData,
        options: filteredOptions
      });
    } catch (err) {
      console.error('Error submitting poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Create New Poll</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poll Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options *
            </label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="ml-2 text-red-500 hover:text-red-700 p-2"
                  disabled={formData.options.length <= 2}
                >
                  ×
                </button>
              </div>
            ))}
            
            {errors.options && (
              <p className="mt-1 text-sm text-red-600">{errors.options}</p>
            )}
            
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
            >
              <FaPlus size={12} className="mr-1" /> Add option
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days)
            </label>
            <select
              name="durationInDays"
              value={formData.durationInDays}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Make this poll public
            </label>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PollsSection;