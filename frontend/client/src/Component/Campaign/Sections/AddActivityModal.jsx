import React, { useState } from 'react';
import { FaTimesCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const AddActivityModal = ({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onClose, 
  isLoading,
  activityTypes,
  statusOptions 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    { id: 1, title: 'Basic Information' },
    { id: 2, title: 'Location & Scheduling' },
    { id: 3, title: 'Impact & Outcomes' },
    { id: 4, title: 'Media & Files' },
    { id: 5, title: 'Additional Details' }
  ];

  const renderStepContent = (step) => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                required
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-lg p-2"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-2"
                maxLength={2000}
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Location & Scheduling</h4>
              
              <div className="mb-4">
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="location.isVirtual"
                    checked={formData.location.isVirtual}
                    onChange={onInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">This is a virtual activity</span>
                </label>
              </div>

              {!formData.location.isVirtual && (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="location.name"
                    placeholder="Venue Name"
                    value={formData.location.name}
                    onChange={onInputChange}
                    className="w-full border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    name="location.address"
                    placeholder="Address"
                    value={formData.location.address}
                    onChange={onInputChange}
                    className="w-full border rounded-lg p-2"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="location.city"
                      placeholder="City"
                      value={formData.location.city}
                      onChange={onInputChange}
                      className="border rounded-lg p-2"
                    />
                    <input
                      type="text"
                      name="location.state"
                      placeholder="State"
                      value={formData.location.state}
                      onChange={onInputChange}
                      className="border rounded-lg p-2"
                    />
                  </div>
                  <input
                    type="text"
                    name="location.country"
                    placeholder="Country"
                    value={formData.location.country}
                    onChange={onInputChange}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              )}

              <div className="mt-6 space-y-4">
                {formData.type === 'event' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Time</label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="datetime-local"
                          name="eventDetails.startTime"
                          value={formData.eventDetails.startTime}
                          onChange={onInputChange}
                          className="border rounded-lg p-2"
                        />
                        <input
                          type="datetime-local"
                          name="eventDetails.endTime"
                          value={formData.eventDetails.endTime}
                          onChange={onInputChange}
                          className="border rounded-lg p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Event Settings</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="eventDetails.requiresRegistration"
                            checked={formData.eventDetails.requiresRegistration}
                            onChange={onInputChange}
                            className="mr-2"
                          />
                          <span className="text-sm">Requires Registration</span>
                        </label>
                        <input
                          type="number"
                          name="eventDetails.maxParticipants"
                          placeholder="Maximum participants (optional)"
                          value={formData.eventDetails.maxParticipants}
                          onChange={onInputChange}
                          className="w-full border rounded-lg p-2"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="font-medium mb-4">Impact & Outcomes</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">People Impacted</label>
                <input
                  type="number"
                  name="impact.peopleImpacted"
                  value={formData.impact.peopleImpacted}
                  onChange={onInputChange}
                  className="w-full border rounded-lg p-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Volunteer Hours</label>
                <input
                  type="number"
                  name="impact.volunteerHours"
                  value={formData.impact.volunteerHours}
                  onChange={onInputChange}
                  className="w-full border rounded-lg p-2"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resources Used</label>
              <textarea
                name="impact.resourcesUsed"
                value={formData.impact.resourcesUsed}
                onChange={onInputChange}
                className="w-full border rounded-lg p-2"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Outcomes</label>
              <textarea
                name="impact.outcomes"
                value={formData.impact.outcomes.join('\n')}
                onChange={(e) => onInputChange({
                  target: {
                    name: 'impact.outcomes',
                    value: e.target.value.split('\n')
                  }
                })}
                placeholder="Enter outcomes (one per line)"
                className="w-full border rounded-lg p-2"
                rows="3"
              />
            </div>

            {formData.type === 'donation' && (
              <div className="space-y-4">
                <h5 className="font-medium">Donation Details</h5>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    name="donationDetails.amount"
                    placeholder="Amount"
                    value={formData.donationDetails.amount}
                    onChange={onInputChange}
                    className="border rounded-lg p-2"
                    min="0"
                  />
                  <select
                    name="donationDetails.currency"
                    value={formData.donationDetails.currency}
                    onChange={onInputChange}
                    className="border rounded-lg p-2"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h4 className="font-medium mb-4">Media & Files</h4>
            
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files).map(file => ({
                    type: file.type.startsWith('image/') ? 'image' : 
                           file.type.startsWith('video/') ? 'video' : 'document',
                    file,
                    caption: ''
                  }));
                  onInputChange({
                    target: {
                      name: 'media',
                      value: [...formData.media, ...files]
                    }
                  });
                }}
                className="w-full"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {formData.media.map((item, index) => (
                <div key={index} className="border rounded-lg p-2">
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={item.caption || ''}
                    onChange={(e) => {
                      const newMedia = [...formData.media];
                      newMedia[index].caption = e.target.value;
                      onInputChange({
                        target: {
                          name: 'media',
                          value: newMedia
                        }
                      });
                    }}
                    className="w-full border rounded p-1 mt-2"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h4 className="font-medium mb-4">Additional Details</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                type="text"
                placeholder="Enter tags (comma-separated)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    if (value && !formData.tags.includes(value)) {
                      onInputChange({
                        target: {
                          name: 'tags',
                          value: [...formData.tags, value]
                        }
                      });
                      e.target.value = '';
                    }
                  }
                }}
                className="w-full border rounded-lg p-2"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => onInputChange({
                        target: {
                          name: 'tags',
                          value: formData.tags.filter((_, i) => i !== index)
                        }
                      })}
                      className="ml-2 text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Visibility Settings</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="visibility.isPublic"
                    checked={formData.visibility.isPublic}
                    onChange={onInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Make this activity public</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="visibility.notifyFollowers"
                    checked={formData.visibility.notifyFollowers}
                    onChange={onInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">Notify campaign followers</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-xl font-bold">Add Campaign Activity</h3>
            <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimesCircle size={24} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between px-6 py-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`flex flex-col items-center ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${currentStep >= step.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
              >
                {step.id}
              </div>
              <span className="text-xs mt-1">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Form content */}
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-4 max-h-[calc(90vh-250px)] overflow-y-auto">
            {renderStepContent(currentStep)}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 flex items-center disabled:opacity-50"
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, totalSteps))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                {isLoading ? 'Saving...' : 'Submit Activity'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityModal;
