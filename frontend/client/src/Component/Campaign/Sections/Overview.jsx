import React from 'react';
import { 
  FaTag, FaMapMarkerAlt, FaVrCardboard, FaLightbulb, 
  FaHandHoldingHeart, FaUsers, FaNewspaper, FaExclamationCircle,
  FaCalendarAlt, FaBuilding, FaCheckCircle, FaLink, FaChartLine,
  FaUserCircle, FaEnvelope, FaUsersCog, FaShareAlt, FaExclamationTriangle, FaUpload, FaComments, FaUserPlus
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const ImpactStats = ({ campaign }) => {
  const metrics = [
    {
      label: "People Reached",
      value: campaign?.engagementMetrics?.peopleReached || 1240,
      icon: <FaUsers className="text-blue-500" />,
      change: "+12%",
      positive: true,
      description: "Number of people who have viewed this campaign"
    },
    {
      label: "Authorities Notified",
      value: campaign?.engagementMetrics?.authoritiesNotified || 3,
      icon: <FaBuilding className="text-amber-500" />,
      change: "New",
      positive: true,
      description: "Official bodies that have been notified"
    },
    {
      label: "Media Coverage",
      value: campaign?.engagementMetrics?.mediaCoverage || 5,
      icon: <FaNewspaper className="text-green-500" />,
      change: "+2",
      positive: true,
      description: "Mentions in news outlets or press"
    },
    {
      label: "Issue Severity",
      value: campaign?.engagementMetrics?.issueSeverity || "High",
      icon: <FaExclamationCircle className="text-red-500" />,
      description: "Impact assessment of the issue"
    },
  ];

  return (
    <div className="mt-8 mb-10">
      <h3 className="flex items-center text-lg font-semibold mb-5 text-gray-800">
        <FaChartLine className="mr-2 text-indigo-600" />
        Campaign Impact
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-lg bg-gray-50">
                {metric.icon}
              </div>
              
              {metric.change && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.positive ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {metric.change}
                </span>
              )}
            </div>
            
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm font-medium text-gray-500">{metric.label}</div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">{metric.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RelatedLinks = ({ campaign }) => {
  const links = campaign?.relatedLinks || [
    { title: "Environmental Protection Agency Report", url: "#" },
    { title: "City Council Meeting Minutes", url: "#" },
    { title: "Community Response Plan", url: "#" }
  ];
  
  if (!links.length) return null;
  
  return (
    <div className="mt-8">
      <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-800">
        <FaLink className="mr-2 text-indigo-600" />
        Related Resources
      </h3>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-100">
        <ul className="divide-y divide-gray-100">
          {links.map((link, index) => (
            <li key={index}>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-3 flex items-center hover:bg-gray-50 transition-colors"
              >
                <span className="h-8 w-8 flex items-center justify-center bg-indigo-50 text-indigo-700 rounded-md mr-3">
                  <FaNewspaper />
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{link.title}</div>
                  <div className="text-xs text-gray-500">External resource</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CampaignTimeline = ({ campaign }) => {
  const events = campaign?.timelineEvents || [
    { date: "2023-12-01", title: "Campaign Started", description: "Initial documentation and evidence collection" },
    { date: "2023-12-15", title: "First Community Meeting", description: "25 local residents attended" },
    { date: "2024-01-10", title: "Petition Submitted", description: "Delivered to city council with 500 signatures" }
  ];
  
  if (!events.length) return null;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="mt-8">
      <h3 className="flex items-center text-lg font-semibold mb-5 text-gray-800">
        <FaCalendarAlt className="mr-2 text-indigo-600" />
        Campaign Timeline
      </h3>
      
      <div className="relative pl-8 border-l-2 border-indigo-100">
        {events.map((event, index) => (
          <div key={index} className="mb-8 relative">
            <div className="absolute -left-10 mt-1.5 w-5 h-5 rounded-full border-4 border-indigo-500 bg-white"></div>
            <div className="text-xs text-indigo-600 font-medium mb-1">{formatDate(event.date)}</div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-gray-900">{event.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrganizerCard = ({ organizer }) => {
  if (!organizer) return null;
  return (
    <div className="flex items-center bg-white shadow rounded-lg p-4 mb-6 border border-gray-100">
      <img
        src={organizer.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(organizer.fullName || organizer.email || 'User')}
        alt={organizer.fullName || organizer.email}
        className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 mr-4"
      />
      <div className="flex-1">
        <div className="font-bold text-lg text-gray-800 flex items-center">
          <FaUserCircle className="mr-2 text-indigo-500" />
          {organizer.fullName || 'Organizer'}
        </div>
        <div className="text-gray-500 text-sm flex items-center">
          <FaEnvelope className="mr-1 text-gray-400" />
          {organizer.email}
        </div>
        {/* Add more info if needed, e.g. role, bio */}
      </div>
      {/* Past campaigns (if available) */}
      {organizer.campaignsCreated && organizer.campaignsCreated.length > 0 && (
        <div className="ml-6">
          <div className="font-semibold text-sm text-gray-700 mb-1">Past Campaigns:</div>
          <ul className="text-xs text-indigo-600 space-y-1">
            {organizer.campaignsCreated.slice(0, 3).map((c, i) => (
              <li key={i}>
                <a href={`/campaigns/${c._id}`} className="hover:underline">{c.title || 'Campaign'}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ActionsSection = ({ onJoin, onSupport, onShare, onReport, onUpload, onChat }) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <button onClick={onJoin} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow">
      <FaUserPlus className="mr-2" /> Join Campaign
    </button>
    <button onClick={onSupport} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow">
      <FaHandHoldingHeart className="mr-2" /> Support
    </button>
    <button onClick={onShare} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow">
      <FaShareAlt className="mr-2" /> Share
    </button>
    <button onClick={onReport} className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow">
      <FaExclamationTriangle className="mr-2" /> Report Issue
    </button>
    <button onClick={onUpload} className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium shadow">
      <FaUpload className="mr-2" /> Upload Proof
    </button>
    <button onClick={onChat} className="flex items-center bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium shadow">
      <FaComments className="mr-2" /> Volunteer Chat
    </button>
  </div>
);

const OverviewSection = ({ campaign, onVisualizeLocation }) => {
  if (!campaign) return null;
  
  const formatLocation = (location) => {
    if (!location) return null;
    
    if (typeof location === 'object') {
      const { city, state, country } = location;
      return [city, state, country].filter(Boolean).join(', ');
    } 
    
    return location;
  };
  
  const handleVisualize = () => {
    if (typeof onVisualizeLocation === 'function') {
      onVisualizeLocation();
    }
  };
  
  const locationString = formatLocation(campaign.location);
  
  // Organizer info (from createdBy)
  const organizer = campaign.createdBy || null;
  // Action handlers (stubbed for now)
  const handleJoin = () => alert('Join Campaign clicked!');
  const handleSupport = () => alert('Support clicked!');
  const handleShare = () => alert('Share clicked!');
  const handleReport = () => alert('Report Issue clicked!');
  const handleUpload = () => alert('Upload Proof clicked!');
  const handleChat = () => alert('Volunteer Chat clicked!');
  
  return (
    <div className="space-y-6">
      {/* Organizer Card */}
      <OrganizerCard organizer={organizer} />
      {/* Actions Section */}
      <ActionsSection
        onJoin={handleJoin}
        onSupport={handleSupport}
        onShare={handleShare}
        onReport={handleReport}
        onUpload={handleUpload}
        onChat={handleChat}
      />
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            <FaLightbulb className="mr-3 text-yellow-500" />
            About This Campaign
          </h2>
          
          {campaign.shortDescription && (
            <div className="mb-6 text-lg text-gray-700 italic border-l-4 border-indigo-400 pl-4 py-3 bg-gradient-to-r from-indigo-50 to-white rounded-r">
              "{campaign.shortDescription}"
            </div>
          )}
          
          <div className="prose max-w-none text-gray-700">
            {campaign.description ? (
              <p className="whitespace-pre-wrap">{campaign.description}</p>
            ) : (
              <p className="text-gray-500 italic">No detailed description provided.</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 border-t border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-grow">
              <h3 className="text-md font-medium mb-2">Campaign Location</h3>
              <div className="bg-white p-3 rounded-lg flex items-center border border-gray-200">
                <FaMapMarkerAlt className="text-red-500 mr-2" size={16} />
                <span className="text-gray-700">
                  {locationString || 'Location not specified'}
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleVisualize}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm shadow-md"
            >
              <FaVrCardboard size={16} />
              <span>Visualize in Street View</span>
            </motion.button>
          </div>
        </div>
      </div>
      
      <ImpactStats campaign={campaign} />
      
      <CampaignTimeline campaign={campaign} />
      
      {campaign.tags && campaign.tags.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-800">
            <FaTag className="mr-2 text-indigo-600" />
            Campaign Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag, index) => (
              <motion.span 
                key={index}
                whileHover={{ y: -2 }}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-sm"
              >
                <FaTag className="mr-1.5 text-indigo-500" size={12} />
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      )}
      
      <RelatedLinks campaign={campaign} />
      
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Support This Campaign</h3>
            <p className="text-indigo-100">
              Every signature counts. Help us make a difference!
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0 bg-white text-indigo-700 px-6 py-3 rounded-lg font-medium shadow-md flex items-center"
          >
            <FaHandHoldingHeart className="mr-2" />
            Sign & Support Now
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;