import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const VictimsStep = ({ initialData, onSubmit, onBack, isSubmitting }) => {
  const [hasVictims, setHasVictims] = useState(initialData?.hasVictims || false);
  const [victims, setVictims] = useState(initialData?.victims || []);
  const [currentVictim, setCurrentVictim] = useState({
    name: '',
    age: '',
    gender: '',
    relationshipToCampaign: '',
    impactDescription: '',
    hasConsented: false,
    privacyLevel: 'anonymous'
  });
  const [errors, setErrors] = useState({});
  const [isEditingIndex, setIsEditingIndex] = useState(-1);
  const [showVictimForm, setShowVictimForm] = useState(false);

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    { value: 'other', label: 'Other' }
  ];

  // Relationship options
  const relationshipOptions = [
    { value: 'direct-victim', label: 'Direct Victim' },
    { value: 'family-member', label: 'Family Member' },
    { value: 'witness', label: 'Witness' },
    { value: 'community-member', label: 'Community Member' },
    { value: 'advocate', label: 'Advocate' }
  ];

  // Privacy level options
  const privacyOptions = [
    { value: 'public', label: 'Public - Full name can be displayed' },
    { value: 'anonymous', label: 'Anonymous - Identity will be protected' },
    { value: 'private', label: 'Private - Information only for campaign organizers' }
  ];

  // Handle toggle for whether campaign has victims
  const handleHasVictimsChange = (e) => {
    const hasVictimsValue = e.target.value === 'yes';
    setHasVictims(hasVictimsValue);
    if (!hasVictimsValue) {
      setVictims([]);
      setShowVictimForm(false);
    }
  };

  // Reset victim form
  const resetVictimForm = () => {
    setCurrentVictim({
      name: '',
      age: '',
      gender: '',
      relationshipToCampaign: '',
      impactDescription: '',
      hasConsented: false,
      privacyLevel: 'anonymous'
    });
    setErrors({});
    setIsEditingIndex(-1);
  };

  // Handle editing an existing victim
  const handleEditVictim = (index) => {
    setCurrentVictim(victims[index]);
    setIsEditingIndex(index);
    setShowVictimForm(true);
    setErrors({});
  };

  // Handle removing a victim
  const handleRemoveVictim = (index) => {
    const updatedVictims = [...victims];
    updatedVictims.splice(index, 1);
    setVictims(updatedVictims);
  };

  // Validate victim form
  const validateVictimForm = () => {
    const newErrors = {};
    
    if (!currentVictim.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!currentVictim.relationshipToCampaign) {
      newErrors.relationshipToCampaign = 'Relationship to campaign is required';
    }
    
    if (!currentVictim.impactDescription.trim()) {
      newErrors.impactDescription = 'Impact description is required';
    }
    
    if (currentVictim.age && (isNaN(currentVictim.age) || currentVictim.age < 0)) {
      newErrors.age = 'Age must be a valid number';
    }
    
    if (!currentVictim.hasConsented) {
      newErrors.hasConsented = 'Consent is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle change in the victim form inputs
  const handleVictimChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentVictim(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle adding/updating a victim
  const handleSaveVictim = (e) => {
    e.preventDefault();
    
    if (!validateVictimForm()) {
      return;
    }
    
    // Create a new array of victims
    let updatedVictims;
    
    if (isEditingIndex >= 0) {
      // Updating existing victim
      updatedVictims = [...victims];
      updatedVictims[isEditingIndex] = {...currentVictim};
    } else {
      // Adding new victim
      updatedVictims = [...victims, {...currentVictim}];
    }
    
    setVictims(updatedVictims);
    setShowVictimForm(false);
    resetVictimForm();
  };

  // Handle final submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If hasVictims is true but no victims added, show error
    if (hasVictims && victims.length === 0) {
      setErrors({ form: 'Please add at least one victim or select "No" if there are no victims' });
      return;
    }
    
    onSubmit({
      hasVictims,
      victims
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Victim Information</h3>
        <p className="text-gray-600 mb-6">
          Provide information about individuals affected by the issue. This information will be handled 
          with care according to their privacy preferences.
        </p>
      </div>

      {errors.form && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {errors.form}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Does your campaign involve specific victims or affected individuals?
        </label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="yes"
              checked={hasVictims}
              onChange={handleHasVictimsChange}
              className="form-radio text-indigo-600"
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="no"
              checked={!hasVictims}
              onChange={handleHasVictimsChange}
              className="form-radio text-indigo-600"
            />
            <span className="ml-2">No</span>
          </label>
        </div>
      </div>

      {hasVictims && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">Affected Individuals</h4>
            {!showVictimForm && (
              <button
                type="button"
                onClick={() => {
                  resetVictimForm();
                  setShowVictimForm(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Person
              </button>
            )}
          </div>

          {/* List of added victims */}
          {victims.length > 0 && !showVictimForm && (
            <div className="mb-6">
              <ul className="divide-y divide-gray-200">
                {victims.map((victim, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{victim.name}</p>
                      <p className="text-sm text-gray-500">
                        {relationshipOptions.find(opt => opt.value === victim.relationshipToCampaign)?.label} | 
                        Privacy: {privacyOptions.find(opt => opt.value === victim.privacyLevel)?.label.split(' - ')[0]}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditVictim(index)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVictim(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Victim form */}
          {showVictimForm && (
            <form onSubmit={handleSaveVictim} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentVictim.name}
                  onChange={handleVictimChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={currentVictim.age}
                  onChange={handleVictimChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={currentVictim.gender}
                  onChange={handleVictimChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Relationship to Campaign <span className="text-red-600">*</span>
                </label>
                <select
                  name="relationshipToCampaign"
                  value={currentVictim.relationshipToCampaign}
                  onChange={handleVictimChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.relationshipToCampaign ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Relationship</option>
                  {relationshipOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.relationshipToCampaign && <p className="text-red-500 text-sm mt-1">{errors.relationshipToCampaign}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Impact Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="impactDescription"
                  value={currentVictim.impactDescription}
                  onChange={handleVictimChange}
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-md ${errors.impactDescription ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Describe how this person has been affected..."
                ></textarea>
                {errors.impactDescription && <p className="text-red-500 text-sm mt-1">{errors.impactDescription}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Privacy Level <span className="text-red-600">*</span>
                </label>
                <select
                  name="privacyLevel"
                  value={currentVictim.privacyLevel}
                  onChange={handleVictimChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {privacyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasConsented"
                  checked={currentVictim.hasConsented}
                  onChange={handleVictimChange}
                  className={`form-checkbox h-5 w-5 text-indigo-600 ${errors.hasConsented ? 'border-red-500' : ''}`}
                />
                <label className="ml-2 block text-gray-700">
                  I confirm this person has consented to be included in this campaign <span className="text-red-600">*</span>
                </label>
              </div>
              {errors.hasConsented && <p className="text-red-500 text-sm mt-1">{errors.hasConsented}</p>}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowVictimForm(false);
                    resetVictimForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {isEditingIndex >= 0 ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {victims.length === 0 && !showVictimForm && (
            <p className="text-gray-500 italic mb-4">No affected individuals added yet.</p>
          )}
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

VictimsStep.propTypes = {
  initialData: PropTypes.shape({
    hasVictims: PropTypes.bool,
    victims: PropTypes.array
  }),
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default VictimsStep;