import React, { useState } from 'react';
import { FaComments, FaGavel, FaUserTie, FaUserMd, FaUserGraduate, FaClipboardCheck, FaCalendarAlt } from 'react-icons/fa';

const ExpertHelpSection = () => {
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [showLegalForm, setShowLegalForm] = useState(false);
  const [expertFormData, setExpertFormData] = useState({
    category: '',
    question: '',
    availability: '',
    urgency: 'medium',
    contactMethod: 'email'
  });
  
  const [legalFormData, setLegalFormData] = useState({
    issue: '',
    details: '',
    jurisdiction: '',
    urgency: 'medium',
    contactMethod: 'email'
  });
  
  const handleExpertSubmit = (e) => {
    e.preventDefault();
    console.log('Expert help requested:', expertFormData);
    // Submit logic would go here
    
    // Reset form
    setShowExpertForm(false);
    setExpertFormData({
      category: '',
      question: '',
      availability: '',
      urgency: 'medium',
      contactMethod: 'email'
    });
  };
  
  const handleLegalSubmit = (e) => {
    e.preventDefault();
    console.log('Legal help requested:', legalFormData);
    // Submit logic would go here
    
    // Reset form
    setShowLegalForm(false);
    setLegalFormData({
      issue: '',
      details: '',
      jurisdiction: '',
      urgency: 'medium',
      contactMethod: 'email'
    });
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Expert Consultation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Talk to Expert Card */}
        <div className="border rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <FaComments className="text-indigo-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Talk to an Expert</h3>
          <p className="text-gray-600 mb-4">
            Connect with experienced activists and professionals in your campaign's area of focus. Get guidance on strategy, outreach, and more.
          </p>
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="px-2 py-1">
              <div className="bg-white rounded-full px-3 py-1 text-sm text-gray-700 shadow-sm">
                <FaUserTie className="inline mr-1 text-indigo-500" /> Strategists
              </div>
            </div>
            <div className="px-2 py-1">
              <div className="bg-white rounded-full px-3 py-1 text-sm text-gray-700 shadow-sm">
                <FaUserMd className="inline mr-1 text-indigo-500" /> Specialists
              </div>
            </div>
            <div className="px-2 py-1">
              <div className="bg-white rounded-full px-3 py-1 text-sm text-gray-700 shadow-sm">
                <FaUserGraduate className="inline mr-1 text-indigo-500" /> Researchers
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowExpertForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm w-full"
          >
            Request Consultation
          </button>
        </div>
        
        {/* LegalEye Card */}
        <div className="border rounded-lg p-6 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <FaGavel className="text-amber-600 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">LegalEye Support</h3>
          <p className="text-gray-600 mb-4">
            Get legal advice related to your campaign from our network of volunteer legal professionals. Understand your rights and legal options.
          </p>
          <div className="space-y-3 mb-4">
            <div className="flex items-center">
              <FaClipboardCheck className="text-amber-600 mr-2" />
              <span className="text-sm text-gray-600">Legal document review</span>
            </div>
            <div className="flex items-center">
              <FaClipboardCheck className="text-amber-600 mr-2" />
              <span className="text-sm text-gray-600">Rights and regulations guidance</span>
            </div>
            <div className="flex items-center">
              <FaClipboardCheck className="text-amber-600 mr-2" />
              <span className="text-sm text-gray-600">Strategic legal advice</span>
            </div>
          </div>
          <button 
            onClick={() => setShowLegalForm(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 shadow-sm w-full"
          >
            Request Legal Help
          </button>
        </div>
      </div>
      
      {/* Expert consultation form modal */}
      {showExpertForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Request Expert Consultation</h3>
                <button 
                  onClick={() => setShowExpertForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleExpertSubmit}>
                <div className="mb-4">
                  <label htmlFor="expert-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Expertise Needed
                  </label>
                  <select
                    id="expert-category"
                    value={expertFormData.category}
                    onChange={(e) => setExpertFormData({...expertFormData, category: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="strategy">Campaign Strategy</option>
                    <option value="media">Media Relations</option>
                    <option value="community">Community Organizing</option>
                    <option value="policy">Policy Analysis</option>
                    <option value="social">Social Media</option>
                    <option value="tech">Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="expert-question" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Question or Issue
                  </label>
                  <textarea
                    id="expert-question"
                    rows={3}
                    value={expertFormData.question}
                    onChange={(e) => setExpertFormData({...expertFormData, question: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe what you need help with..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="expert-availability" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaCalendarAlt className="inline mr-1" /> Your Availability
                  </label>
                  <input
                    id="expert-availability"
                    type="text"
                    value={expertFormData.availability}
                    onChange={(e) => setExpertFormData({...expertFormData, availability: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="E.g., Weekdays after 5pm, Any time on weekends"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <div className="flex space-x-4">
                    {['low', 'medium', 'high'].map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="urgency"
                          value={level}
                          checked={expertFormData.urgency === level}
                          onChange={() => setExpertFormData({...expertFormData, urgency: level})}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <div className="flex space-x-4">
                    {['email', 'phone', 'video call'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="contactMethod"
                          value={method}
                          checked={expertFormData.contactMethod === method}
                          onChange={() => setExpertFormData({...expertFormData, contactMethod: method})}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowExpertForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Legal help form modal */}
      {showLegalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Request Legal Help</h3>
                <button 
                  onClick={() => setShowLegalForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleLegalSubmit}>
                <div className="mb-4">
                  <label htmlFor="legal-issue" className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Issue Type
                  </label>
                  <select
                    id="legal-issue"
                    value={legalFormData.issue}
                    onChange={(e) => setLegalFormData({...legalFormData, issue: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select an issue type</option>
                    <option value="rights">Rights Violation</option>
                    <option value="permit">Permits and Regulations</option>
                    <option value="defamation">Defamation/Libel</option>
                    <option value="harassment">Harassment</option>
                    <option value="confidentiality">Privacy/Confidentiality</option>
                    <option value="document">Legal Document Review</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="legal-details" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Details
                  </label>
                  <textarea
                    id="legal-details"
                    rows={3}
                    value={legalFormData.details}
                    onChange={(e) => setLegalFormData({...legalFormData, details: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe your legal issue in detail..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
                    Jurisdiction (Location)
                  </label>
                  <input
                    id="jurisdiction"
                    type="text"
                    value={legalFormData.jurisdiction}
                    onChange={(e) => setLegalFormData({...legalFormData, jurisdiction: e.target.value})}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="City, State/Province, Country"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <div className="flex space-x-4">
                    {['low', 'medium', 'high'].map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="legal-urgency"
                          value={level}
                          checked={legalFormData.urgency === level}
                          onChange={() => setLegalFormData({...legalFormData, urgency: level})}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <div className="flex space-x-4">
                    {['email', 'phone', 'video call'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="radio"
                          name="legal-contactMethod"
                          value={method}
                          checked={legalFormData.contactMethod === method}
                          onChange={() => setLegalFormData({...legalFormData, contactMethod: method})}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowLegalForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertHelpSection;