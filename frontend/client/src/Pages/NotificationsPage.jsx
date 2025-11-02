import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaCheck, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaUser, 
  FaUsers, 
  FaRocket, 
  FaComment, 
  FaHeart, 
  FaCalendarAlt, 
  FaCog, 
  FaFilter, 
  FaSearch, 
  FaTrash, 
  FaArchive, 
  FaEye, 
  FaEyeSlash,
  FaClock,
  FaMapMarkerAlt,
  FaHandshake,
  FaBullhorn,
  FaEnvelope,
  FaArrowLeft
} from 'react-icons/fa';

const NotificationsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Mock notification data with Indian context
  const notifications = [
    {
      id: 1,
      type: 'project_update',
      title: 'Digital India Village Connect - New Milestone Reached',
      message: 'The project has successfully connected 50 new villages to digital services this month.',
      timestamp: '2 hours ago',
      isRead: false,
      priority: 'high',
      category: 'project',
      actionUrl: '/campaigns/1',
      icon: FaRocket,
      color: 'blue'
    },
    {
      id: 2,
      type: 'community_mention',
      title: 'You were mentioned in a discussion',
      message: 'Arjun Singh mentioned you in a discussion about rural development strategies.',
      timestamp: '4 hours ago',
      isRead: false,
      priority: 'medium',
      category: 'community',
      actionUrl: '/community',
      icon: FaComment,
      color: 'green'
    },
    {
      id: 3,
      type: 'event_reminder',
      title: 'Digital India Hackathon 2024 - Reminder',
      message: 'The hackathon starts in 2 days. Don\'t forget to prepare your team and project ideas.',
      timestamp: '6 hours ago',
      isRead: true,
      priority: 'high',
      category: 'event',
      actionUrl: '/events/hackathon-2024',
      icon: FaCalendarAlt,
      color: 'purple'
    },
    {
      id: 4,
      type: 'admin_announcement',
      title: 'New Community Guidelines Update',
      message: 'We\'ve updated our community guidelines to better serve our growing Indian civic tech community.',
      timestamp: '1 day ago',
      isRead: true,
      priority: 'medium',
      category: 'admin',
      actionUrl: '/community/guidelines',
      icon: FaBullhorn,
      color: 'orange'
    },
    {
      id: 5,
      type: 'project_invitation',
      title: 'Invitation to Join Swachh Bharat Abhiyan',
      message: 'You\'ve been invited to join the Swachh Bharat Abhiyan project as a community coordinator.',
      timestamp: '2 days ago',
      isRead: false,
      priority: 'high',
      category: 'project',
      actionUrl: '/campaigns/2',
      icon: FaHandshake,
      color: 'green'
    },
    {
      id: 6,
      type: 'discussion_reply',
      title: 'New Reply in Rural Development Discussion',
      message: 'Meera Devi replied to your comment about community engagement in Indian villages.',
      timestamp: '3 days ago',
      isRead: true,
      priority: 'low',
      category: 'community',
      actionUrl: '/community/discussions/1',
      icon: FaComment,
      color: 'blue'
    },
    {
      id: 7,
      type: 'system_alert',
      title: 'Profile Update Required',
      message: 'Please update your profile information to help us better connect you with relevant projects.',
      timestamp: '5 days ago',
      isRead: false,
      priority: 'medium',
      category: 'system',
      actionUrl: '/settings/profile',
      icon: FaCog,
      color: 'gray'
    },
    {
      id: 8,
      type: 'project_completion',
      title: 'Skill India Digital Training - Project Completed',
      message: 'Congratulations! The Skill India Digital Training project has been successfully completed.',
      timestamp: '1 week ago',
      isRead: true,
      priority: 'medium',
      category: 'project',
      actionUrl: '/campaigns/3',
      icon: FaCheckCircle,
      color: 'green'
    }
  ];

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { id: 'project', label: 'Projects', count: notifications.filter(n => n.category === 'project').length },
    { id: 'community', label: 'Community', count: notifications.filter(n => n.category === 'community').length },
    { id: 'event', label: 'Events', count: notifications.filter(n => n.category === 'event').length },
    { id: 'admin', label: 'Admin', count: notifications.filter(n => n.category === 'admin').length }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'project': return 'text-blue-600 bg-blue-50';
      case 'community': return 'text-green-600 bg-green-50';
      case 'event': return 'text-purple-600 bg-purple-50';
      case 'admin': return 'text-orange-600 bg-orange-50';
      case 'system': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'unread' && !notification.isRead) ||
                         notification.category === activeFilter;
    
    const matchesSearch = searchQuery === '' || 
                         notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const markAsRead = (notificationId) => {
    // In a real app, this would make an API call
    console.log('Marking notification as read:', notificationId);
  };

  const markAllAsRead = () => {
    // In a real app, this would make an API call
    console.log('Marking all notifications as read');
  };

  const deleteNotification = (notificationId) => {
    // In a real app, this would make an API call
    console.log('Deleting notification:', notificationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft size={16} />
              Back
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Stay updated with your civic activities and community</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FaCheck size={14} />
                Mark All Read
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FaCog size={14} />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">You're all caught up! Check back later for new updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div 
                    key={notification.id} 
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`${
                          notification.isRead ? 'text-gray-600' : 'text-blue-600'
                        }`} size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`text-lg font-semibold ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                            
                            {/* Tags */}
                            <div className="flex items-center gap-2 mt-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(notification.category)}`}>
                                {notification.category}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FaClock size={12} />
                                {notification.timestamp}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mark as read"
                              >
                                <FaEye size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mt-4">
                          <Link
                            to={notification.actionUrl}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                          >
                            <FaEye size={12} />
                            View Details
                          </Link>
                          {notification.type === 'project_invitation' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                              <FaHandshake size={12} />
                              Accept Invitation
                            </button>
                          )}
                          {notification.type === 'event_reminder' && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                              <FaCalendarAlt size={12} />
                              Add to Calendar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBell className="text-blue-600" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">Customize how and when you receive notifications.</p>
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <FaCog size={14} />
              Manage Settings
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaUsers className="text-green-600" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Community Updates</h3>
            </div>
            <p className="text-gray-600 mb-4">Stay connected with your community activities and discussions.</p>
            <Link to="/community" className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <FaUsers size={14} />
              Visit Community
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FaRocket className="text-purple-600" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            </div>
            <p className="text-gray-600 mb-4">Get updates on projects you're involved in or interested in.</p>
            <Link to="/campaigns" className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <FaRocket size={14} />
              View Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
