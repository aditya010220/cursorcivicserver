import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRegClock, FaUsers, FaArrowRight, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CampaignsAroundYou = () => {
  // Mock data for nearby campaigns with added color themes
  const nearbyCampaigns = [
    {
      id: 'c1',
      title: "Save Riverside Park",
      location: "Downtown, 2.3 miles",
      coverImage: "https://images.unsplash.com/photo-1552084117-56a987666449?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      supporters: 423,
      daysLeft: 14,
      category: "Environment",
      color: "green",
      description: "Help preserve our local green space from commercial development."
    },
    {
      id: 'c2',
      title: "Fund New Community Library",
      location: "Westside, 1.7 miles",
      coverImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      supporters: 156,
      daysLeft: 30,
      category: "Education",
      color: "blue",
      description: "Support literacy in our community with a new public library branch."
    },
    {
      id: 'c3',
      title: "Safer Streets Initiative",
      location: "Northgate, 3.5 miles",
      coverImage: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      supporters: 291,
      daysLeft: 21,
      category: "Safety",
      color: "orange",
      description: "Advocating for better street lighting and traffic calming measures."
    }
  ];

  // State for the current slide index
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNextSlide();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [activeIndex, isTransitioning]);

  // Function to get gradient overlay based on color
  const getGradientStyle = (color) => {
    const styles = {
      green: "from-green-900/70 to-transparent",
      blue: "from-blue-900/70 to-transparent",
      orange: "from-orange-900/70 to-transparent",
      red: "from-red-900/70 to-transparent",
      purple: "from-purple-900/70 to-transparent",
      default: "from-gray-900/70 to-transparent"
    };
    return styles[color] || styles.default;
  };

  // Function to get pill style based on color
  const getPillStyle = (color) => {
    const styles = {
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
      purple: "bg-purple-100 text-purple-800",
      default: "bg-gray-100 text-gray-800"
    };
    return styles[color] || styles.default;
  };

  const goToPrevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(prevIndex => 
      prevIndex === 0 ? nearbyCampaigns.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(prevIndex => 
      prevIndex === nearbyCampaigns.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Current campaign to display
  const currentCampaign = nearbyCampaigns[activeIndex];

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-gray-800">Near You</h2>
        <button className="text-xs flex items-center space-x-1 text-gray-500 hover:text-black bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
          <span>View map</span>
          <FaArrowRight size={8} />
        </button>
      </div>
      
      <div className="flex-1 relative">
        {/* Main Slide */}
        <div className="h-full w-full relative rounded-md overflow-hidden">
          <img 
            src={currentCampaign.coverImage} 
            alt={currentCampaign.title} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t ${getGradientStyle(currentCampaign.color)}`}></div>
          
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <div className="flex items-start justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPillStyle(currentCampaign.color)}`}>
                {currentCampaign.category}
              </span>
              
              <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs">
                <FaMapMarkerAlt className="mr-1" size={10} />
                <span>{currentCampaign.location}</span>
              </div>
            </div>
            
            <div className="mt-auto">
              <h2 className="text-lg font-bold text-white mb-1 drop-shadow-md">
                {currentCampaign.title}
              </h2>
              
              <p className="text-sm text-white/90 mb-2 line-clamp-2">
                {currentCampaign.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <div className="flex items-center text-white">
                    <FaUsers className="mr-1" size={12} />
                    <span>{currentCampaign.supporters} supporters</span>
                  </div>
                  
                  <div className="flex items-center text-white">
                    <FaRegClock className="mr-1" size={12} />
                    <span>{currentCampaign.daysLeft} days left</span>
                  </div>
                </div>
                
                <Link to={`/campaigns/${currentCampaign.id}`} 
                      className="bg-white/90 hover:bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium transition-colors">
                  View Campaign
                </Link>
              </div>
            </div>
          </div>
          
          {/* Navigation arrows */}
          <button 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={goToPrevSlide}
          >
            <FaChevronLeft size={12} />
          </button>
          
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={goToNextSlide}
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      </div>
      
      {/* Slide indicators */}

      
      <button className="mt-3 w-full py-1.5 border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        Explore All Nearby Campaigns
      </button>
    </div>
  );
};

export default CampaignsAroundYou;