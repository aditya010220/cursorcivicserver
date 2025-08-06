import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/authContext';

const TeamSetupStep = ({ initialData, onSubmit, onBack, isSubmitting }) => {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    coLeader: initialData?.coLeader || null,
    socialMediaCoordinator: initialData?.socialMediaCoordinator || null,
    volunteerCoordinator: initialData?.volunteerCoordinator || null,
    financeManager: initialData?.financeManager || null,
    additionalMembers: initialData?.additionalMembers || [],
    communicationChannels: initialData?.communicationChannels || {
      email: true,
      slack: false,
      whatsapp: false,
      other: ''
    }
  });
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    customRoleTitle: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Handle input changes for main roles
  const handleRoleChange = (role, field, value) => {
    setFormData(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };
  
  // Handle input for new team member
  const handleNewMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle communication channel changes
  const handleChannelChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      communicationChannels: {
        ...prev.communicationChannels,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };
  
  // Add a new team member
  const addTeamMember = () => {
    // Validate new member data
    const memberErrors = {};
    
    if (!newMember.name.trim()) memberErrors.name = 'Name is required';
    if (!newMember.email.trim()) memberErrors.email = 'Email is required';
    if (!newMember.role) memberErrors.role = 'Role is required';
    if (newMember.role === 'custom' && !newMember.customRoleTitle.trim()) {
      memberErrors.customRoleTitle = 'Custom role title is required';
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newMember.email && !emailRegex.test(newMember.email)) {
      memberErrors.email = 'Invalid email format';
    }
    
    if (Object.keys(memberErrors).length > 0) {
      setErrors(memberErrors);
      return;
    }
    
    // Add member to the list
    const memberToAdd = {
      ...newMember,
      id: Date.now().toString(), // Temporary ID for frontend
    };
    
    setFormData(prev => ({
      ...prev,
      additionalMembers: [...prev.additionalMembers, memberToAdd]
    }));
    
    // Reset form and errors
    setNewMember({
      name: '',
      email: '',
      role: '',
      customRoleTitle: ''
    });
    setErrors({});
  };
  
  // Remove a team member
  const removeTeamMember = (idToRemove) => {
    setFormData(prev => ({
      ...prev,
      additionalMembers: prev.additionalMembers.filter(
        member => member.id !== idToRemove && member._id !== idToRemove
      )
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the communication channels data correctly
    const formattedData = {
      ...formData,
      communicationChannels: {
        ...formData.communicationChannels,
        // Format 'other' as an array of objects if it's a string
        other: formData.communicationChannels.other ? 
          [{ 
            name: 'Other', 
            url: formData.communicationChannels.other
          }] : []
      }
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Campaign Team Setup</h3>
        <p className="text-sm text-gray-500">
          Build your campaign team. Invite members to different roles to collaborate effectively.
        </p>
      </div>
      
      {/* Key Team Roles Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-800 mb-4">Key Team Roles</h4>
        
        {/* Campaign Leader (Current User) - Not editable */}
        <div className="mb-4 p-3 border rounded-md bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="font-medium text-gray-900">Campaign Leader</h5>
              <p className="text-sm text-gray-500">Overall campaign management and strategy</p>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">You</div>
          </div>
          <div className="mt-2">
            <p className="text-sm">{currentUser?.fullName || currentUser?.displayName || 'Campaign Leader'}</p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
        </div>
        
        {/* Co-Leader */}
        <div className="mb-4 p-3 border rounded-md bg-white">
          <h5 className="font-medium text-gray-900">Co-Leader</h5>
          <p className="text-sm text-gray-500 mb-3">Assists in leading the campaign</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="coLeader-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="coLeader-name"
                value={formData.coLeader?.name || ''}
                onChange={(e) => handleRoleChange('coLeader', 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Co-Leader's name"
              />
            </div>
            <div>
              <label htmlFor="coLeader-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="coLeader-email"
                value={formData.coLeader?.email || ''}
                onChange={(e) => handleRoleChange('coLeader', 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Co-Leader's email"
              />
            </div>
          </div>
        </div>
        
        {/* Social Media Coordinator */}
        <div className="mb-4 p-3 border rounded-md bg-white">
          <h5 className="font-medium text-gray-900">Social Media Coordinator</h5>
          <p className="text-sm text-gray-500 mb-3">Manages campaign's social media presence</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="socialMedia-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="socialMedia-name"
                value={formData.socialMediaCoordinator?.name || ''}
                onChange={(e) => handleRoleChange('socialMediaCoordinator', 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Coordinator's name"
              />
            </div>
            <div>
              <label htmlFor="socialMedia-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="socialMedia-email"
                value={formData.socialMediaCoordinator?.email || ''}
                onChange={(e) => handleRoleChange('socialMediaCoordinator', 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Coordinator's email"
              />
            </div>
          </div>
        </div>
        
        {/* Volunteer Coordinator */}
        <div className="mb-4 p-3 border rounded-md bg-white">
          <h5 className="font-medium text-gray-900">Volunteer Coordinator</h5>
          <p className="text-sm text-gray-500 mb-3">Manages volunteers and assigns tasks</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="volunteer-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="volunteer-name"
                value={formData.volunteerCoordinator?.name || ''}
                onChange={(e) => handleRoleChange('volunteerCoordinator', 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Coordinator's name"
              />
            </div>
            <div>
              <label htmlFor="volunteer-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="volunteer-email"
                value={formData.volunteerCoordinator?.email || ''}
                onChange={(e) => handleRoleChange('volunteerCoordinator', 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Coordinator's email"
              />
            </div>
          </div>
        </div>
        
        {/* Finance Manager */}
        <div className="mb-4 p-3 border rounded-md bg-white">
          <h5 className="font-medium text-gray-900">Finance Manager</h5>
          <p className="text-sm text-gray-500 mb-3">Handles campaign finances and resources</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="finance-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="finance-name"
                value={formData.financeManager?.name || ''}
                onChange={(e) => handleRoleChange('financeManager', 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Manager's name"
              />
            </div>
            <div>
              <label htmlFor="finance-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="finance-email"
                value={formData.financeManager?.email || ''}
                onChange={(e) => handleRoleChange('financeManager', 'email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Manager's email"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Team Members */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-800 mb-4">Additional Team Members</h4>
        
        {/* List of existing additional members */}
        {formData.additionalMembers.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Current Team Members</h5>
            <div className="space-y-2">
              {formData.additionalMembers.map((member, index) => (
                <div key={member.id || member._id || index} className="flex items-center justify-between p-3 border rounded-md bg-white">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500">
                      {member.role === 'custom' ? member.customRoleTitle : 
                        member.role.charAt(0).toUpperCase() + member.role.slice(1).replace('-', ' ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(member.id || member._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add new team member form */}
        <div className="p-3 border rounded-md bg-white">
          <h5 className="font-medium text-gray-900 mb-3">Add New Team Member</h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="member-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="member-name"
                name="name"
                value={newMember.name}
                onChange={handleNewMemberChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.name ? 'border-red-300' : ''}`}
                placeholder="Team member's name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="member-email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="member-email"
                name="email"
                value={newMember.email}
                onChange={handleNewMemberChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.email ? 'border-red-300' : ''}`}
                placeholder="Team member's email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="member-role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="member-role"
                name="role"
                value={newMember.role}
                onChange={handleNewMemberChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.role ? 'border-red-300' : ''}`}
              >
                <option value="">Select a role</option>
                <option value="researcher">Researcher</option>
                <option value="content-creator">Content Creator</option>
                <option value="outreach-coordinator">Outreach Coordinator</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="legal-advisor">Legal Advisor</option>
                <option value="technical-support">Technical Support</option>
                <option value="custom">Custom Role</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>
            
            {newMember.role === 'custom' && (
              <div>
                <label htmlFor="custom-role" className="block text-sm font-medium text-gray-700">Custom Role Title</label>
                <input
                  type="text"
                  id="custom-role"
                  name="customRoleTitle"
                  value={newMember.customRoleTitle}
                  onChange={handleNewMemberChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.customRoleTitle ? 'border-red-300' : ''}`}
                  placeholder="Enter custom role title"
                />
                {errors.customRoleTitle && <p className="mt-1 text-sm text-red-600">{errors.customRoleTitle}</p>}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addTeamMember}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Member
            </button>
          </div>
        </div>
      </div>
      
      {/* Communication Channels */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-800 mb-4">Team Communication</h4>
        
        <div className="p-3 border rounded-md bg-white">
          <h5 className="font-medium text-gray-900 mb-3">Communication Channels</h5>
          <p className="text-sm text-gray-500 mb-4">How will your team communicate?</p>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="channel-email"
                name="email"
                type="checkbox"
                checked={formData.communicationChannels?.email || false}
                onChange={handleChannelChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <label htmlFor="channel-email" className="ml-2 block text-sm text-gray-700">Email</label>
            </div>
            
            <div className="flex items-center">
              <input
                id="channel-slack"
                name="slack"
                type="checkbox"
                checked={formData.communicationChannels?.slack || false}
                onChange={handleChannelChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <label htmlFor="channel-slack" className="ml-2 block text-sm text-gray-700">Slack</label>
            </div>
            
            <div className="flex items-center">
              <input
                id="channel-whatsapp"
                name="whatsapp"
                type="checkbox"
                checked={formData.communicationChannels?.whatsapp || false}
                onChange={handleChannelChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
              />
              <label htmlFor="channel-whatsapp" className="ml-2 block text-sm text-gray-700">WhatsApp</label>
            </div>
            
            <div>
              <label htmlFor="channel-other" className="block text-sm font-medium text-gray-700">Other Channel</label>
              <input
                type="text"
                id="channel-other"
                name="other"
                value={formData.communicationChannels?.other || ''}
                onChange={handleChannelChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Specify other communication channels"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="pt-5">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Next Step: Evidence'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TeamSetupStep;