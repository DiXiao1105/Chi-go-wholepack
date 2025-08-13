import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Utensils, Eye } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { communityAPI } from '../services/api';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  // Like feature removed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  // Like feature removed
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getPosts();
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  // Like feature removed

  // Fix date formatting: handle undefined/null/invalid
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openPostDetail = (post) => {
    setSelectedPost(post);
  };

  const closePostDetail = () => {
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchPosts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Community Trips</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover amazing Chicago itineraries shared by fellow travelers. Get inspired 
            and find your next adventure in the Windy City!
          </p>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <User size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share your Chicago trip!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Post Header: avatar, username, and date in a row */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      {/* Username and date next to avatar */}
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{post.username ? post.username : 'User'}</span>
                        <span className="flex items-center text-sm text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(post.created_at || post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => openPostDetail(post)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">{post.description}</p>
                </div>

                {/* Checklist Preview */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {post.checklist.slice(0, 4).map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-16 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.target.src = item.itemType === 'restaurant' 
                              ? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop'
                              : 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=100&h=100&fit=crop';
                          }}
                        />
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <div className="flex items-center justify-center mt-1">
                          {item.itemType === 'restaurant' ? (
                            <Utensils size={10} className="text-green-600 mr-1" />
                          ) : (
                            <MapPin size={10} className="text-blue-600 mr-1" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">{item.itemType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {post.checklist.length > 4 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                      +{post.checklist.length - 4} more places
                    </p>
                  )}
                </div>

                {/* Post Footer */}
                  {/* Post Footer: only show checklist summary, no like button */}
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <div className="flex items-center justify-end">
                      <div className="text-sm text-gray-500">
                        {post.checklist.length} places • {post.checklist.filter(item => item.itemType === 'attraction').length} attractions • {post.checklist.filter(item => item.itemType === 'restaurant').length} restaurants
                      </div>
                    </div>
                  </div>
         
              </article>
            ))}
          </div>
        )}

        {/* Post Detail Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
                    {/* Show 'by username' or fallback to 'User' */}
                    <p className="text-gray-600 mt-1">by {selectedPost.username ? selectedPost.username : 'User'}</p>
                  </div>
                  <button
                    onClick={closePostDetail}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-700 mb-6">{selectedPost.description}</p>
                
                <h3 className="text-lg font-semibold mb-4">Complete Itinerary</h3>
                <div className="space-y-3">
                  {selectedPost.checklist.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = item.itemType === 'restaurant' 
                            ? 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop'
                            : 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=100&h=100&fit=crop';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <div className="flex items-center mt-1">
                          {item.itemType === 'restaurant' ? (
                            <Utensils size={12} className="text-green-600 mr-1" />
                          ) : (
                            <MapPin size={12} className="text-blue-600 mr-1" />
                          )}
                          <span className="text-sm text-gray-500 capitalize">{item.itemType}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;