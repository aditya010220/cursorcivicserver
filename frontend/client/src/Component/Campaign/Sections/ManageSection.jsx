import React, { useState } from 'react';
import { FaEdit, FaTrash, FaUserPlus, FaBell, FaChartLine, FaExclamationTriangle, FaLock, FaCog, FaListUl, FaCalendarAlt } from 'react-icons/fa';

const ManageSection = ({ campaign }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    shortDescription: campaign?.shortDescription || '',
    description: campaign?.description || '',
    category: campaign?.category || '',
    tags: campaign?.tags?.join(', ') || '',
    location: {
      city: campaign?.location?.city || '',
      state: campaign?.location?.state || '',
      country: campaign?.location?.country || ''
    }
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like location.city
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated campaign:', formData);
    // Save logic would go here
    
    setEditMode(false);
  };
  
  const confirmDelete = () => {
    if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      console.log("Deleting campaign...");
      // Delete logic would go here
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <nav className="flex -mb-px overflow-x-auto">
          <button 
            onClick={() => setActiveTab('general')}
            className={`${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            <FaCog className="inline mr-2" /> General Settings
          </button>
          
          <button 
            onClick={() => setActiveTab('team')}
            className={`${
              activeTab === 'team'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            <FaUserPlus className="inline mr-2" /> Team Management
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`${
              activeTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            <FaBell className="inline mr-2" /> Notifications
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`${
              activeTab === 'analytics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            <FaChartLine className="inline mr-2" /> Analytics
          </button>
          
          <button 
            onClick={() => setActiveTab('danger')}
            className={`${
              activeTab === 'danger'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-red-700 hover:border-red-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
          >
            <FaExclamationTriangle className="inline mr-2" /> Danger Zone
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">General Campaign Settings</h2>
              
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaEdit className="mr-2" /> Edit Campaign
                </button>
              )}
            </div>
            
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
                      Short Description
                    </label>
                    <input
                      type="text"
                      name="shortDescription"
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">Brief summary of your campaign (100 characters max)</p>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={5}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select Category</option>
                      <option value="human-rights">Human Rights</option>
                      <option value="environmental">Environmental</option>
                      <option value="political">Political</option>
                      <option value="social-justice">Social Justice</option>
                      <option value="education">Education</option>
                      <option value="health">Health</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">Comma-separated tags (e.g. justice, reform, equality)</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="location.city"
                        id="location.city"
                        value={formData.location.city}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="location.state"
                        id="location.state"
                        value={formData.location.state}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        name="location.country"
                        id="location.country"
                        value={formData.location.country}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Campaign Title</h3>
                  <p className="mt-1 text-lg text-gray-900">{campaign?.title || 'No title'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Short Description</h3>
                  <p className="mt-1 text-sm text-gray-900">{campaign?.shortDescription || 'No description'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Description</h3>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{campaign?.description || 'No description'}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {campaign?.category?.replace(/-/g, ' ') || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {campaign?.tags && campaign.tags.length > 0 ? (
                        campaign.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {campaign?.location ? (
                      [
                        campaign.location.city,
                        campaign.location.state,
                        campaign.location.country
                      ].filter(Boolean).join(', ') || 'No location specified'
                    ) : (
                      'No location specified'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Team Management Tab */}
        {activeTab === 'team' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Team Management</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Current Team</h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Campaign Leader</h4>
                {campaign?.team?.leader ? (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center mr-3">
                      {campaign.team.leader.profileImage ? (
                        <img 
                          src={campaign.team.leader.profileImage} 
                          alt={campaign.team.leader.name} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <FaUserPlus className="text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{campaign.team.leader.name}</p>
                      <p className="text-sm text-gray-500">{campaign.team.leader.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No leader assigned</p>
                )}
              </div>
              
              {/* Other team members */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Co-leader */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Co-Leader</h4>
                  {campaign?.team?.coLeader?.userId ? (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <FaUserPlus className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.team.coLeader.name}</p>
                        <p className="text-sm text-gray-500">{campaign.team.coLeader.email}</p>
                      </div>
                    </div>
                  ) : (
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <FaUserPlus className="mr-2" /> Add Co-Leader
                    </button>
                  )}
                </div>
                
                {/* Social Media Coordinator */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Social Media Coordinator</h4>
                  {campaign?.team?.socialMediaCoordinator?.userId ? (
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <FaUserPlus className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.team.socialMediaCoordinator.name}</p>
                        <p className="text-sm text-gray-500">{campaign.team.socialMediaCoordinator.email}</p>
                      </div>
                    </div>
                  ) : (
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <FaUserPlus className="mr-2" /> Add Social Media Coordinator
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSection;