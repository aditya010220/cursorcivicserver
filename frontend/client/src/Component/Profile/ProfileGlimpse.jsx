import React from 'react';
import { FaChartLine, FaNewspaper, FaUsers } from 'react-icons/fa';

const ProfileGlimpse = ({ userData }) => {
  // Modern loading skeleton
  if (!userData) {
    return (
      <div className="bg-white rounded-lg p-4 animate-pulse shadow-sm overflow-hidden">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
        <div className="flex justify-between">
          <div className="h-8 bg-gray-200 rounded w-[32%]"></div>
          <div className="h-8 bg-gray-200 rounded w-[32%]"></div>
          <div className="h-8 bg-gray-200 rounded w-[32%]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Profile header - simplified */}
        <div className="flex items-center mb-3">
          {userData?.profilePicture ? (
            <img 
              src={userData.profilePicture} 
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-500 font-bold text-xl">
              {userData?.fullName?.[0] || 'U'}
            </div>
          )}
          
          <div className="ml-3">
            <h3 className="text-base font-semibold text-gray-800">{userData?.fullName || 'Anonymous User'}</h3>
            <p className="text-xs text-gray-500">
              {userData?.location?.city ? `${userData.location.city}, ${userData.location.country}` : 'Location not specified'}
            </p>
          </div>
        </div>
        
        {/* Bio - short and concise */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {userData?.bio || `Civic activist working on social impact initiatives and community engagement.`}
        </p>
        
        {/* Stats - simplified cards with minimal info */}
        <div className="flex justify-between">
          <div className="px-2 py-1 text-center">
            <div className="text-sm font-bold text-gray-800">
              {userData?.impactScore || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <FaChartLine className="mr-1" size={8} /> Impact
            </div>
          </div>
          
          <div className="px-2 py-1 text-center border-l border-r border-gray-100">
            <div className="text-sm font-bold text-gray-800">
              {userData?.campaignsCreated?.length || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <FaNewspaper className="mr-1" size={8} /> Campaigns
            </div>
          </div>
          
          <div className="px-2 py-1 text-center">
            <div className="text-sm font-bold text-gray-800">
              {userData?.followersCount || 0}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-center">
              <FaUsers className="mr-1" size={8} /> Network
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileGlimpse;