import React from 'react';
import { 
  FaChartLine, FaHistory, FaClipboardList, FaPhotoVideo,
  FaUsers, FaUserShield, FaComments, FaGavel, FaWrench, FaCogs,
  FaSignature, FaHandsHelping, FaPoll, FaLayerGroup, 
  FaNewspaper, FaChevronRight
} from 'react-icons/fa';

const CampaignSidebar = ({ activeTab, setActiveTab, campaign, isUserAuthorized }) => {
  // Group tabs into categories for better organization
  const tabGroups = [
    {
      title: "Overview",
      icon: <FaNewspaper className="text-indigo-500" />,
      tabs: [
        { id: 'overview', icon: <FaChartLine className="mr-3 text-lg" />, label: 'Overview', show: true },
        { id: 'updates', icon: <FaHistory className="mr-3 text-lg" />, label: 'Updates', show: true },
      ]
    },
    {
      title: "Campaign Content",
      icon: <FaClipboardList className="text-green-500" />,
      tabs: [
        { id: 'evidence', icon: <FaClipboardList className="mr-3 text-lg" />, label: 'Evidence', show: true },
        { id: 'gallery', icon: <FaPhotoVideo className="mr-3 text-lg" />, label: 'Gallery', show: true },
        { id: 'activity', icon: <FaLayerGroup className="mr-3 text-lg" />, label: 'Activity', show: true },
      ]
    },
    {
      title: "People",
      icon: <FaUsers className="text-blue-500" />,
      tabs: [
        { id: 'team', icon: <FaUsers className="mr-3 text-lg" />, label: 'Team', show: true },
        { id: 'victims', icon: <FaUserShield className="mr-3 text-lg" />, label: 'Victims', show: !!campaign?.hasVictims },
        { id: 'supporters', icon: <FaHandsHelping className="mr-3 text-lg" />, label: 'Supporters', show: true },
        { id: 'signatures', icon: <FaSignature className="mr-3 text-lg" />, label: 'Signatures', show: true },
      ]
    },
    {
      title: "Engagement",
      icon: <FaComments className="text-amber-500" />,
      tabs: [
        { id: 'polls', icon: <FaPoll className="mr-3 text-lg" />, label: 'Polls', show: true },
        { id: 'expert', icon: <FaComments className="mr-3 text-lg" />, label: 'Expert Help', show: true },
        { id: 'legal', icon: <FaGavel className="mr-3 text-lg" />, label: 'LegalEye', show: true },
      ]
    },
    {
      title: "Administration",
      icon: <FaCogs className="text-gray-500" />,
      tabs: [
        { id: 'manage', icon: <FaWrench className="mr-3 text-lg" />, label: 'Manage', show: isUserAuthorized },
        { id: 'settings', icon: <FaCogs className="mr-3 text-lg" />, label: 'Settings', show: isUserAuthorized }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-sm flex-shrink-0">
      {/* Campaign Header */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white flex-shrink-0">
        <h3 className="font-bold text-lg text-gray-900 tracking-tight flex items-center">
          {campaign?.title ? (
            <div className="truncate max-w-[180px]">{campaign.title}</div>
          ) : (
            "Campaign Menu"
          )}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs px-2 py-1 bg-white shadow-sm border border-gray-100 text-gray-600 rounded-full font-medium">
            {campaign?.status || "Active"}
          </span>
          
          <div className="text-xs text-gray-500">ID: {campaign?._id?.substring(0, 6)}</div>
        </div>
      </div>
      
      {/* Navigation - removed scrollbar styling classes */}
      <nav className="py-3 flex-grow overflow-y-auto">
        {tabGroups.map((group, index) => {
          // Only show groups that have at least one visible tab
          const visibleTabs = group.tabs.filter(tab => tab.show);
          if (visibleTabs.length === 0) return null;
          
          return (
            <div key={index} className="mb-5 px-2">
              <h4 className="flex items-center text-xs font-medium uppercase tracking-wider text-gray-500 px-3 mb-3">
                {group.icon && <span className="mr-2">{group.icon}</span>}
                {group.title}
              </h4>
              <ul className="space-y-1">
                {visibleTabs.map(tab => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id 
                          ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-700 font-medium shadow-sm border-l-4 border-indigo-500' 
                          : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className={`${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                      
                      {/* Add count badges for certain sections if data is available */}
                      {tab.id === 'evidence' && campaign?.evidence?.length > 0 && (
                        <span className="ml-auto bg-white border border-gray-100 shadow-sm text-gray-700 text-xs rounded-full px-2 py-0.5">
                          {campaign.evidence.length}
                        </span>
                      )}
                      
                      {tab.id === 'supporters' && campaign?.supporterCount > 0 && (
                        <span className="ml-auto bg-white border border-gray-100 shadow-sm text-gray-700 text-xs rounded-full px-2 py-0.5">
                          {campaign.supporterCount}
                        </span>
                      )}
                      
                      {activeTab === tab.id && (
                        <FaChevronRight className="ml-auto text-xs text-indigo-500" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      
      {/* Campaign Progress */}
      {campaign?.engagementMetrics && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1.5">
            <span>Campaign Progress</span>
            <span className="font-medium">{campaign.engagementMetrics.completionPercentage || 0}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${campaign.engagementMetrics.completionPercentage || 0}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Enhanced footer */}
      <div className="p-4 border-t border-gray-200 bg-white bg-opacity-90 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 font-medium">
              The Civic Chronicle
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Est. {new Date().getFullYear()}
            </div>
          </div>
          <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
            v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CampaignSidebar;