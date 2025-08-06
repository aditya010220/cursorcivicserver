import React from 'react';
import { FaUser } from 'react-icons/fa';

const TeamSection = ({ campaign }) => {
  if (!campaign || !campaign.team) return null;
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Campaign Team</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Leader Card */}
        {campaign.team?.leader && (
          <div className="border-2 border-indigo-400 rounded-lg p-4 bg-indigo-50 relative">
            <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Leader
            </div>
            <div className="flex items-center mb-4 mt-4">
              <div className="w-14 h-14 bg-indigo-200 rounded-full flex items-center justify-center mr-4">
                {campaign.team.leader.profileImage ? (
                  <img 
                    src={campaign.team.leader.profileImage} 
                    alt={campaign.team.leader.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <FaUser className="text-indigo-600 text-2xl" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-900">{campaign.team.leader.name}</h3>
                <p className="text-sm text-gray-500">{campaign.team.leader.email || ''}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Campaign leader responsible for overall direction and strategy.
            </p>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm">
              Contact
            </button>
          </div>
        )}
        
        {/* Co-Leader Card */}
        {campaign.team?.coLeader && campaign.team.coLeader.userId && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                {campaign.team.coLeader.profileImage ? (
                  <img 
                    src={campaign.team.coLeader.profileImage} 
                    alt={campaign.team.coLeader.name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <FaUser className="text-indigo-500 text-xl" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-gray-900">{campaign.team.coLeader.name}</h3>
                <p className="text-sm text-gray-500">Co-Leader</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Assists the campaign leader and shares leadership responsibilities.
            </p>
            <button className="w-full bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 text-sm">
              Contact
            </button>
          </div>
        )}
        
        {/* Other team members would go here */}
      </div>
    </div>
  );
};

export default TeamSection;