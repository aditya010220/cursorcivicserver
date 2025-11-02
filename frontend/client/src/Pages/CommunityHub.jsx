import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaLightbulb, 
  FaCalendarAlt, 
  FaComments, 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaSearch, 
  FaFilter,
  FaPlus,
  FaMapMarkerAlt,
  FaClock,
  FaUserPlus,
  FaRocket,
  FaHandshake,
  FaChartLine,
  FaGlobe,
  FaArrowLeft
} from 'react-icons/fa';

const CommunityHub = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Mock data for community content
  const featuredProjects = [
    {
      id: 1,
      title: "Digital India Village Connect",
      description: "Bringing internet connectivity and digital services to remote villages across India",
      author: "Priya Sharma",
      authorRole: "Digital India Coordinator",
      location: "Mumbai, Maharashtra",
      supporters: 3247,
      status: "active",
      tags: ["Digital India", "Rural Development", "Technology"],
      image: "https://images.unsplash.com/photo-1573164574511-73c773193279?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Swachh Bharat Abhiyan",
      description: "Community-driven cleanliness and sanitation initiatives across Indian cities and villages",
      author: "Rajesh Kumar",
      authorRole: "Sanitation Officer",
      location: "Delhi, NCR",
      supporters: 1892,
      status: "active",
      tags: ["Cleanliness", "Sanitation", "Community Health"],
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2a8?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Skill India Digital Training",
      description: "Providing digital skills training to youth and women in rural and urban areas",
      author: "Anita Patel",
      authorRole: "Skill Development Trainer",
      location: "Bangalore, Karnataka",
      supporters: 1634,
      status: "completed",
      tags: ["Skill Development", "Education", "Women Empowerment"],
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop"
    }
  ];

  const discussions = [
    {
      id: 1,
      title: "How can we make civic tech more accessible in rural India?",
      author: "Arjun Singh",
      replies: 23,
      likes: 45,
      timeAgo: "2 hours ago",
      category: "Rural Development"
    },
    {
      id: 2,
      title: "Best practices for community engagement in Indian villages",
      author: "Meera Devi",
      replies: 18,
      likes: 32,
      timeAgo: "4 hours ago",
      category: "Community"
    },
    {
      id: 3,
      title: "Open data initiatives in Indian cities",
      author: "Vikram Reddy",
      replies: 31,
      likes: 67,
      timeAgo: "6 hours ago",
      category: "Digital India"
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Digital India Hackathon 2024",
      date: "March 15-17, 2024",
      location: "New Delhi, India",
      attendees: 500,
      type: "Hackathon"
    },
    {
      id: 2,
      title: "Rural Digital Literacy Workshop",
      date: "March 22, 2024",
      location: "Online",
      attendees: 200,
      type: "Workshop"
    },
    {
      id: 3,
      title: "Smart City Initiative Meetup",
      date: "March 28, 2024",
      location: "Bangalore, Karnataka",
      attendees: 120,
      type: "Meetup"
    }
  ];

  const communityStats = {
    totalMembers: 25420,
    activeProjects: 156,
    completedProjects: 389,
    totalDiscussions: 892
  };

  const filters = [
    { id: 'all', label: 'All', icon: FaGlobe },
    { id: 'projects', label: 'Projects', icon: FaRocket },
    { id: 'discussions', label: 'Discussions', icon: FaComments },
    { id: 'events', label: 'Events', icon: FaCalendarAlt }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaArrowLeft size={16} />
              Back
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Community Hub
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect, collaborate, and create change with civic innovators, volunteers, and community leaders across India
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold">{communityStats.totalMembers.toLocaleString()}</div>
                <div className="text-gray-300">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{communityStats.activeProjects}</div>
                <div className="text-gray-300">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{communityStats.completedProjects}</div>
                <div className="text-gray-300">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{communityStats.totalDiscussions}</div>
                <div className="text-gray-300">Discussions</div>
              </div>
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
                placeholder="Search projects, discussions, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Projects */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Featured Projects</h2>
                  <Link to="/campaigns" className="text-black hover:text-gray-600 font-medium">
                    View All
                  </Link>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {featuredProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaUserPlus size={14} />
                            {project.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt size={14} />
                            {project.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaHeart size={14} />
                            {project.supporters} supporters
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                            <FaHandshake size={14} />
                            Join Project
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <FaComment size={14} />
                            Discuss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Discussions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Discussions</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                    <FaPlus size={14} />
                    Start Discussion
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {discussions.map((discussion) => (
                  <div key={discussion.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>by {discussion.author}</span>
                          <span>•</span>
                          <span>{discussion.timeAgo}</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {discussion.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaComment size={14} />
                        {discussion.replies} replies
                      </div>
                      <div className="flex items-center gap-1">
                        <FaHeart size={14} />
                        {discussion.likes} likes
                      </div>
                      <button className="flex items-center gap-1 text-black hover:text-gray-600">
                        <FaShare size={14} />
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/campaigns/create"
                  className="flex items-center gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaRocket size={18} />
                  <span>Start a Project</span>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaUsers size={18} />
                  <span>Find Collaborators</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaLightbulb size={18} />
                  <span>Share an Idea</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                  <FaCalendarAlt size={18} />
                  <span>Create Event</span>
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt size={12} />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt size={12} />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaUsers size={12} />
                        {event.attendees} attending
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <FaHandshake className="text-black mt-1" size={14} />
                  <span>Be respectful and inclusive</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaLightbulb className="text-black mt-1" size={14} />
                  <span>Share constructive ideas</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaChartLine className="text-black mt-1" size={14} />
                  <span>Focus on civic impact</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaGlobe className="text-black mt-1" size={14} />
                  <span>Think globally, act locally</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
