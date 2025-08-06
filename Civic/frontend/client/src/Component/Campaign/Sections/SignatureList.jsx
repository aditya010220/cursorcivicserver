import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaSpinner, FaClock, FaQuoteLeft } from 'react-icons/fa';

const SignatureList = ({ campaignId }) => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchSupporters = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/campaigns/${campaignId}/supporters?page=${pageNum}&limit=10`
      );

      if (response.data.success) {
        const nonAnonymousSupporters = response.data.data.filter(
          supporter => !supporter.isAnonymous
        );

        if (pageNum === 1) {
          setSupporters(nonAnonymousSupporters);
        } else {
          setSupporters(prev => [...prev, ...nonAnonymousSupporters]);
        }

        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      }
    } catch (err) {
      setError('Failed to load supporters');
      console.error('Error fetching supporters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
  }, [campaignId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSupporters(nextPage);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Signatures & Support</h2>
      
      {loading && supporters.length === 0 ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-gray-500" size={24} />
        </div>
      ) : supporters.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No public supporters yet. Be the first to sign!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supporters.map((supporter, index) => (
              <div 
                key={index}
                className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {supporter.user?.profilePicture ? (
                      <img
                        src={supporter.user.profilePicture}
                        alt={supporter.user.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaUser className="text-gray-400" size={20} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {supporter.user.fullName}
                      </h3>
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaClock className="mr-1" size={12} />
                        {formatDate(supporter.supportedAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      Supported as: {supporter.supportType.charAt(0).toUpperCase() + supporter.supportType.slice(1)}
                    </p>
                    
                    {supporter.message && (
                      <div className="mt-2 text-sm text-gray-700">
                        <FaQuoteLeft className="text-gray-300 mb-1" size={12} />
                        <p className="italic">{supporter.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full inline-flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Supporters</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SignatureList;