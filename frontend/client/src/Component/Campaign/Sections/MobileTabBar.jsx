import React from 'react';

const MobileTabBar = ({ activeTab, setActiveTab, campaign, isUserAuthorized }) => {
  return (
    <div className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="px-4 py-2">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="overview">Overview</option>
            <option value="updates">Updates</option>
            <option value="evidence">Evidence ({campaign?.evidence?.length || 0})</option>
            <option value="gallery">Gallery</option>
            <option value="activity">Activity Timeline</option>
            <option value="team">Team</option>
            {campaign?.hasVictims && <option value="victims">Victims</option>}
            <option value="supporters">Supporters</option>
            <option value="signatures">Signatures</option>
            <option value="polls">Polls</option>
            <option value="expert">Talk to Expert</option>
            <option value="legal">LegalEye</option>
            {isUserAuthorized && <option value="manage">Manage Campaign</option>}
            {isUserAuthorized && <option value="settings">Campaign Settings</option>}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MobileTabBar;