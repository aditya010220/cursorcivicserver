import React, { useState } from 'react';
import { FaRegNewspaper, FaPlusCircle, FaShareAlt, FaThumbsUp, FaComment } from 'react-icons/fa';

const UpdatesSection = ({ campaign, formatDate }) => {
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  
  const updates = campaign?.updates || [];
  
  const handleAddUpdate = (e) => {
    e.preventDefault();
    // Add update logic would go here
    setShowAddUpdate(false);
    setNewUpdate({ title: '', content: '' });
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Campaign Updates</h2>
        <button 
          onClick={() => setShowAddUpdate(true)}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <FaPlusCircle className="mr-1" /> Add Update
        </button>
      </div>
      
      {/* Add update form */}
      {showAddUpdate && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Post a New Update</h3>
          <form onSubmit={handleAddUpdate}>
            <div className="mb-3">
              <label htmlFor="update-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input 
                id="update-title"
                type="text" 
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Update title"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="update-content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea 
                id="update-content"
                value={newUpdate.content}
                onChange={(e) => setNewUpdate({...newUpdate, content: e.target.value})}
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Share the latest about your campaign..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setShowAddUpdate(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Post Update
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Updates list */}
      {updates.length > 0 ? (
        <div className="space-y-6">
          {updates.map((update, index) => (
            <div key={index} className="border-l-4 border-indigo-500 pl-4 pb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{update.title}</h3>
                <span className="text-sm text-gray-500">{formatDate(update.postedAt || update.createdAt)}</span>
              </div>
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{update.content}</p>
              
              {update.mediaLinks && update.mediaLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 mb-3">
                  {update.mediaLinks.map((link, i) => (
                    <a 
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <FaRegNewspaper className="mr-1" /> Media {i+1}
                    </a>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Posted by {update.postedBy?.fullName || "Campaign Team"}
                </div>
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-indigo-600 flex items-center text-sm">
                    <FaThumbsUp className="mr-1" /> {update.likes || 0}
                  </button>
                  <button className="text-gray-500 hover:text-indigo-600 flex items-center text-sm">
                    <FaComment className="mr-1" /> {update.comments?.length || 0}
                  </button>
                  <button className="text-gray-500 hover:text-indigo-600 flex items-center text-sm">
                    <FaShareAlt className="mr-1" /> Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaRegNewspaper className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Updates Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There haven't been any updates posted for this campaign yet. Updates help keep supporters informed about progress and new developments.
          </p>
        </div>
      )}
    </div>
  );
};

export default UpdatesSection;