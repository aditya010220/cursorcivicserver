import React, { useState, useEffect } from 'react';

const BasicInfoStep = ({ initialData, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    location: initialData?.location || {
      type: 'local',
      city: '',
      state: '',
      country: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (e.g., location.city)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      e.target.value = '';
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Validate the form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';
    
    if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
    if (formData.shortDescription.length > 200) newErrors.shortDescription = 'Short description must be less than 200 characters';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 5000) newErrors.description = 'Description must be less than 5000 characters';
    
    if (!formData.category) newErrors.category = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Campaign Basic Information</h3>
        <p className="text-sm text-gray-500">
          Provide essential details about your campaign to help people understand your cause.
        </p>
      </div>
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Campaign Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            ${errors.title ? 'border-red-300' : ''}`}
          placeholder="Give your campaign a compelling title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      {/* Short Description */}
      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
          Short Description *
        </label>
        <input
          type="text"
          id="shortDescription"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            ${errors.shortDescription ? 'border-red-300' : ''}`}
          placeholder="Brief summary of your campaign (max 200 characters)"
        />
        {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>}
      </div>
      
      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            ${errors.category ? 'border-red-300' : ''}`}
        >
          <option value="">Select a category</option>
          <option value="environment">Environment</option>
          <option value="education">Education</option>
          <option value="healthcare">Healthcare</option>
          <option value="human-rights">Human Rights</option>
          <option value="animal-welfare">Animal Welfare</option>
          <option value="poverty">Poverty</option>
          <option value="equality">Equality</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="governance">Governance</option>
          <option value="public-safety">Public Safety</option>
          <option value="other">Other</option>
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>
      
      {/* Full Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Full Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            ${errors.description ? 'border-red-300' : ''}`}
          placeholder="Provide a detailed description of your campaign, including what you're trying to achieve and why it matters"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>
      
      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (Press Enter to add)
        </label>
        <input
          type="text"
          id="tags"
          onKeyDown={handleTagInput}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Add keywords related to your campaign"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-200 text-indigo-600 hover:bg-indigo-300"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      
      {/* Location */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Campaign Location</h4>
        
        <div>
          <label htmlFor="location.type" className="block text-sm font-medium text-gray-700">
            Location Type
          </label>
          <select
            id="location.type"
            name="location.type"
            value={formData.location.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="local">Local</option>
            <option value="state">State/Provincial</option>
            <option value="national">National</option>
            <option value="international">International</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="location.city"
              name="location.city"
              value={formData.location.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
              State/Province
            </label>
            <input
              type="text"
              id="location.state"
              name="location.state"
              value={formData.location.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="location.country"
              name="location.country"
              value={formData.location.country}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Next Step: Team Setup'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BasicInfoStep;