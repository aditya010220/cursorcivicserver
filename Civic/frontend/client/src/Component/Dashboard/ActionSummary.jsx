import React from 'react';
import { 
  FaPlusCircle, FaUsers, FaEnvelope, FaBullhorn 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ActionSummary = () => {
  const actionItems = [
    {
      icon: <FaPlusCircle className="w-5 h-5" />,
      text: "Create Campaign",
      path: "/campaigns/create",
      primary: true
    },
    {
      icon: <FaUsers className="w-5 h-5" />,
      text: "Join a Team",
      path: "/community",
      primary: false
    },
    {
      icon: <FaEnvelope className="w-5 h-5" />,
      text: "Invite People",
      path: "/invite",
      primary: false
    },
    {
      icon: <FaBullhorn className="w-5 h-5" />,
      text: "Share Updates",
      path: "/updates/share",
      primary: false
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actionItems.map((item, index) => (
        <Link 
          key={index} 
          to={item.path}
          className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${
            item.primary 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
          }`}
        >
          <div className="mb-2">
            {item.icon}
          </div>
          <span className="text-sm font-medium">{item.text}</span>
        </Link>
      ))}
    </div>
  );
};

export default ActionSummary;