import React, { useState } from 'react';
import { FaCamera, FaSearch, FaPlay, FaExpand } from 'react-icons/fa';

const GallerySection = ({ campaign, isUserAuthorized }) => {
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Mock gallery data (replace with actual data from campaign)
  const galleryItems = campaign?.mediaGallery || [];
  
  // Filter media based on search
  const filteredMedia = galleryItems.filter(media => {
    if (!search) return true;
    return media.caption?.toLowerCase().includes(search.toLowerCase()) ||
           media.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
  });
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold">Campaign Gallery</h2>
        
        {isUserAuthorized && (
          <button className="mt-3 sm:mt-0 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">
            <FaCamera className="mr-2" /> Add Photos
          </button>
        )}
      </div>
      
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search gallery..."
          />
        </div>
      </div>
      
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((media, index) => (
            <div 
              key={index} 
              className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity relative group"
              onClick={() => setSelectedMedia(media)}
            >
              {media.type === 'image' && (
                <img 
                  src={media.url} 
                  alt={media.caption || `Campaign image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              {media.type === 'video' && (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <FaPlay className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {media.thumbnail && (
                    <img 
                      src={media.thumbnail} 
                      alt={media.caption || `Campaign video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              
              {/* Expand button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="bg-black bg-opacity-50 text-white p-1.5 rounded-md hover:bg-opacity-70"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMedia(media);
                  }}
                >
                  <FaExpand size={14} />
                </button>
              </div>
              
              {/* Caption on hover */}
              {media.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {media.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Photos Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {search 
              ? "No media matches your search criteria." 
              : "There are no photos in the gallery yet. Add photos to give supporters a visual understanding of your campaign."
            }
          </p>
        </div>
      )}
      
      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMedia(null)}>
          <div className="max-w-4xl w-full max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative">
                {selectedMedia.type === 'image' && (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.caption || "Campaign image"}
                    className="w-full h-auto"
                  />
                )}
                {selectedMedia.type === 'video' && (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    className="w-full h-auto"
                    poster={selectedMedia.thumbnail}
                  />
                )}
                <button 
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  onClick={() => setSelectedMedia(null)}
                >
                  &times;
                </button>
              </div>
              {(selectedMedia.caption || selectedMedia.date) && (
                <div className="p-4">
                  {selectedMedia.caption && (
                    <p className="text-lg font-medium">{selectedMedia.caption}</p>
                  )}
                  {selectedMedia.date && (
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(selectedMedia.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GallerySection;