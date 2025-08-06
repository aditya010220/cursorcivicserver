import React, { useState, useEffect } from 'react';
import { FaArrowTrendUp, FaArrowRight, FaRegHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const TrendingCampaigns = () => {
  // Updated data for trending campaigns
  const trendingCampaigns = [
    {
      id: 't1',
      title: "Save Hyderabad's Forests from Deforestation",
      organization: "Hyderabad Green Initiative",
      image: "https://im.indiatimes.in/content/2020/Jan/2_5e11748f961e1.jpg",
      trend: "+250% this week",
      supporters: "30K",
      category: "Environment"
    },
    {
      id: 't2',
      title: "Justice for Kashmir's Pahalgham Victims",
      organization: "Human Rights Watch Kashmir",
      image: "https://media.assettype.com/outlookindia/2025-04-23/2lgig43f/WhatsApp-Image-2025-04-23-at-7.13.14-PM.jpeg?w=640&auto=format%2Ccompress&fit=max&format=webp&dpr=1.0",
      trend: "+190% this week",
      supporters: "22K",
      category: "Human Rights"
    },
    {
      id: 't3',
      title: "Fix Bangalore's Dangerous Road Crashes",
      organization: "Safe Roads Foundation",
      image: "https://im.whatshot.in/img/2021/Jan/is-2-1595483222-1610688351.jpg",
      trend: "+140% this week",
      supporters: "18K",
      category: "Public Safety"
    }
  ];

  // State for the slideshow
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNextSlide();
      }
    }, 7000); // Slightly longer than CampaignsAroundYou for a staggered effect
    return () => clearInterval(interval);
  }, [activeIndex, isTransitioning]);

  const goToPrevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(prevIndex =>
      prevIndex === 0 ? trendingCampaigns.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(prevIndex =>
      prevIndex === trendingCampaigns.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Current campaign to display
  const currentCampaign = trendingCampaigns[activeIndex];

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <FaArrowTrendUp className="text-black mr-2" size={16} />
          <h2 className="text-lg font-bold text-gray-800">Trending Now</h2>
        </div>
        <div className="flex items-center">
          <div className="text-xs text-gray-500 mr-2">
            <span className="font-medium">{activeIndex + 1}</span>/{trendingCampaigns.length}
          </div>
          <button className="text-xs text-gray-500 hover:text-black flex items-center bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
            View all <FaArrowRight size={10} className="ml-1" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Main Slideshow */}
        <div className="h-full rounded-lg overflow-hidden relative group">
          <Link to={`/campaigns/${currentCampaign.id}`} className="block h-full">
            <div className="relative h-full">
              <img
                src={currentCampaign.image}
                alt={currentCampaign.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="absolute top-3 left-3">
                  <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white inline-flex items-center">
                    <FaArrowTrendUp className="mr-1" size={10} />
                    {currentCampaign.trend}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs text-white">
                      {currentCampaign.category}
                    </span>
                    <button className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white/40 transition-colors">
                      <FaRegHeart className="text-white" size={12} />
                    </button>
                  </div>

                  <h3 className="text-white font-bold text-base mb-1">{currentCampaign.title}</h3>
                  <p className="text-white/80 text-xs mb-1">{currentCampaign.organization}</p>

                  <div className="flex justify-between items-center">
                    <span className="text-white text-xs">{currentCampaign.supporters} supporters</span>
                    <span className="text-white/70 text-xs">Trending nationwide</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation arrows */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevSlide}
          >
            <FaChevronLeft size={14} />
          </button>

          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNextSlide}
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingCampaigns;