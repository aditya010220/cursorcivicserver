import React from 'react';
import { FaBookmark, FaRegBookmark, FaShare, FaEllipsisH } from 'react-icons/fa';

const NewsFeed = () => {
  // Mock data for news items with color categories
  const newsItems = [
    {
      id: 1,
      title: "New Environmental Protection Bill Passes Local Legislature",
      source: "Civic Times",
      category: "Environment",
      color: "green",
      image: "https://images.unsplash.com/photo-1552799446-159ba9523315?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      timeAgo: "2 hours ago",
      excerpt: "The bill introduces stricter regulations on industrial waste management and increases penalties for violations.",
      isBookmarked: false
    },
    {
      id: 2,
      title: "Community Clean-up Drive Removes 2 Tons of Plastic from River",
      source: "Local Action News",
      category: "Community",
      color: "blue",
      image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      timeAgo: "Yesterday",
      excerpt: "Over 200 volunteers participated in the weekend event organized by River Protection Coalition.",
      isBookmarked: true
    },
    {
      id: 3,
      title: "City Council Votes on Public Housing Initiative Next Week",
      source: "Metro Reporter",
      category: "Housing",
      color: "orange",
      image: "https://images.unsplash.com/photo-1556156653-e5a7c69cc263?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      timeAgo: "3 days ago",
      excerpt: "The proposed initiative would allocate $50 million for affordable housing construction over the next five years.",
      isBookmarked: false
    }
  ];

  // Function to get category style based on color
  const getCategoryStyle = (color) => {
    const styles = {
      green: "bg-green-100 text-green-800 border border-green-200",
      blue: "bg-blue-100 text-blue-800 border border-blue-200",
      orange: "bg-orange-100 text-orange-800 border border-orange-200",
      red: "bg-red-100 text-red-800 border border-red-200",
      purple: "bg-purple-100 text-purple-800 border border-purple-200",
      default: "bg-gray-100 text-gray-800 border border-gray-200"
    };
    return styles[color] || styles.default;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-gray-800">Civic News Feed</h2>
        <button className="text-xs text-gray-500 hover:text-black bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
          See all
        </button>
      </div>
      
      <div className="space-y-3 flex-1">
        {newsItems.map(item => (
          <div key={item.id} className="flex border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
              />
            </div>
            
            <div className="ml-2 flex-1">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-500">{item.source} • {item.timeAgo}</span>
                <div className="flex space-x-1">
                  {item.isBookmarked ? 
                    <button className="p-0.5 hover:bg-gray-100 rounded-full transition-colors">
                      <FaBookmark className="text-blue-500" size={10} />
                    </button> : 
                    <button className="p-0.5 hover:bg-gray-100 rounded-full transition-colors">
                      <FaRegBookmark className="text-gray-400 hover:text-blue-500" size={10} />
                    </button>
                  }
                  <button className="p-0.5 hover:bg-gray-100 rounded-full transition-colors">
                    <FaEllipsisH className="text-gray-400" size={10} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mt-0.5 line-clamp-1 text-xs">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.excerpt}</p>
              
              <div className="mt-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(item.color)}`}>
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;