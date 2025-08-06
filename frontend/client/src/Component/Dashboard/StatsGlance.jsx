import React from 'react';

const StatsGlance = ({ stats }) => {
  // Default stats if none provided
  const defaultStats = {
    activeCampaigns: 3,
    supporters: 178,
    impact: 95,
    contributions: 7
  };

  const statsData = stats || defaultStats;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Campaigns</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{statsData.activeCampaigns}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Supporters</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{statsData.supporters}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Impact Score</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{statsData.impact}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contributions</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{statsData.contributions}</p>
      </div>
    </div>
  );
};

export default StatsGlance;