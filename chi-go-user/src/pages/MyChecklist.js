import React, { useState, useEffect } from 'react';
import { Share2, Trash2, MapPin, Calendar, Utensils } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { communityAPI, checklistAPI } from '../services/api';

const MyChecklist = () => {
  const { user } = useAuth();
  const [checklist, setChecklist] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchChecklist();
  }, [user]);


  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      const res = await checklistAPI.get(userId);
      console.log('Checklist API get response:', res.data);
      setChecklist(res.data.items || []);
    } catch (err) {
      setChecklist([]);
      console.error('Error fetching checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromChecklist = async (itemId, itemType) => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      await checklistAPI.remove(userId, itemId, itemType);
      fetchChecklist();
    } catch (err) {
      console.error('Error removing from checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      alert('Please login to share your checklist');
      return;
    }

    if (!shareForm.title.trim()) {
      alert('Please enter a title for your post');
      return;
    }

    if (checklist.length === 0) {
      alert('Your checklist is empty. Add some attractions and restaurants first!');
      return;
    }

    setLoading(true);
    try {
      const userId = user?._id || user?.id;
      const postData = {
        user_id: userId,
        title: shareForm.title.trim(),
        description: shareForm.description.trim(),
        checklist: checklist.map(item => ({
          itemId: item.itemId,
          itemType: item.itemType,
          name: item.name,
          image: item.image
        }))
      };
      await communityAPI.createPost(postData);
      alert('Checklist shared successfully!');
      setShowShareModal(false);
      setShareForm({ title: '', description: '' });
    } catch (error) {
      console.error('Error sharing checklist:', error);
      alert('Failed to share checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.itemType]) {
      acc[item.itemType] = [];
    }
    acc[item.itemType].push(item);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently added';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to login to view your checklist.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trip Checklist</h1>
            <p className="text-gray-600 mt-1">
              {checklist.length} {checklist.length === 1 ? 'item' : 'items'} planned
            </p>
          </div>
          {checklist.length > 0 && (
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Share2 size={18} />
              <span>Share My Trip</span>
            </button>
          )}
        </div>

        {checklist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <MapPin size={64} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your checklist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding attractions and restaurants to plan your perfect Chicago trip! 
              Explore our curated collections and build your personalized itinerary.
            </p>
            <div className="space-x-4">
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.location.href = '/attractions'}
              >
                Browse Attractions
              </button>
              <button
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => window.location.href = '/restaurants'}
              >
                Find Restaurants
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Attractions Section */}
            {groupedChecklist.attraction && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin size={20} className="mr-2 text-blue-600" />
                  Attractions ({groupedChecklist.attraction.length})
                </h2>
                <div className="grid gap-4">
                  {groupedChecklist.attraction.map((item, index) => (
                    <div key={`${item.itemId}-${item.itemType}`} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=100&h=100&fit=crop';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar size={12} className="mr-1" />
                              <span>Added {formatDate(item.addedAt)}</span>
                              {item.category && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromChecklist(item.itemId, item.itemType)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from checklist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restaurants Section */}
            {groupedChecklist.restaurant && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Utensils size={20} className="mr-2 text-green-600" />
                  Restaurants ({groupedChecklist.restaurant.length})
                </h2>
                <div className="grid gap-4">
                  {groupedChecklist.restaurant.map((item, index) => (
                    <div key={`${item.itemId}-${item.itemType}`} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar size={12} className="mr-1" />
                              <span>Added {formatDate(item.addedAt)}</span>
                              {item.cuisine && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {item.cuisine}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromChecklist(item.itemId, item.itemType)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from checklist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-4">Share Your Chicago Trip</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your {checklist.length} selected places with the Chi-Go community!
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Title *
                  </label>
                  <input
                    type="text"
                    value={shareForm.title}
                    onChange={(e) => setShareForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Perfect Weekend in Chicago"
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={shareForm.description}
                    onChange={(e) => setShareForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Tell others about your trip experience..."
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {shareForm.description.length}/500 characters
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="flex flex-wrap gap-1">
                    {checklist.slice(0, 6).map((item, index) => (
                      <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                        {item.name}
                      </span>
                    ))}
                    {checklist.length > 6 && (
                      <span className="text-xs text-gray-500">
                        +{checklist.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={!shareForm.title.trim() || loading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Sharing...' : 'Share Trip'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChecklist;