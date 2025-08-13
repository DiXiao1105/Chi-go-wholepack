import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Utensils } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import { restaurantsAPI, checklistAPI } from '../services/api';
import { useAuth } from '../components/AuthContext';

const Restaurants = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // 保证 itemId 一定有值，优先 _id、id，否则用 name+cuisine 兜底
  // Ensure itemId is always present: prefer _id, then id, fallback to name_cuisine
  const getRestaurantId = (restaurant) => restaurant._id || restaurant.id || `${restaurant.name}_${restaurant.cuisine}`;

  
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantsAPI.getAll();
      setRestaurants(response.data);
    } catch (err) {
      setError('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  
  const fetchChecklist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await checklistAPI.get(user.id);
      let items = res.data.items;
      if (!Array.isArray(items)) items = [];
      setChecklist(items);
      console.log('[fetchChecklist] checklist:', items);
    } catch (err) {
      setChecklist([]);
      console.error('Error fetching checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    if (user) fetchChecklist();
    // eslint-disable-next-line
  }, [user]);


  const isInChecklist = (restaurant) => {
    const rid = getRestaurantId(restaurant);
    return checklist.some(item => item.itemId === rid && item.itemType === 'restaurant');
  };

  // 用 add_to_user_checklist (POST, json body)
  // Add a restaurant to the checklist using the backend API
  const addToChecklist = async (restaurant) => {
    if (!user) {
      alert('Please login to add to your checklist');
      return;
    }
    const item = {
      itemId: getRestaurantId(restaurant),
      itemType: 'restaurant',
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image,
      location: restaurant.location,
      cuisine: restaurant.cuisine,
      addedAt: new Date().toISOString()
    };
    try {
      setLoading(true);
      await checklistAPI.add(user.id, item);
      await fetchChecklist();
    } catch (err) {
      console.error('Error adding to checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  // 用 remove_from_user_checklist (DELETE, json body)
  // Remove a restaurant from the checklist using the backend API
  const removeFromChecklist = async (restaurant) => {
    if (!user) return;
    try {
      setLoading(true);
      await checklistAPI.remove(user.id, getRestaurantId(restaurant), 'restaurant');
      await fetchChecklist();
    } catch (err) {
      console.error('Error removing from checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
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
            onClick={fetchRestaurants}
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Chicago Restaurants</h1>
          <div className="text-sm text-gray-600">
            {checklist.filter(item => item.itemType === 'restaurant').length} restaurants in your checklist
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurants List */}
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <div key={getRestaurantId(restaurant)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-32 h-32 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop';
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {restaurant.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center">
                        <Utensils size={10} className="mr-1" />
                        {restaurant.cuisine}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {restaurant.description}
                    </p>
                    {restaurant.location?.address && (
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin size={12} className="mr-1" />
                        <span className="truncate">{restaurant.location.address}</span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => isInChecklist(restaurant)
                          ? removeFromChecklist(restaurant)
                          : addToChecklist(restaurant)
                        }
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isInChecklist(restaurant)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isInChecklist(restaurant) ? (
                          <>
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Add to trip</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {restaurants.length === 0 && (
              <div className="text-center py-12">
                <Utensils size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants found</h3>
                <p className="text-gray-600">Check back later for new dining options!</p>
              </div>
            )}
          </div>
          {/* Map */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Restaurants Map</h3>
              <p className="text-sm text-gray-600 mb-4">
                Discover {restaurants.length} restaurants across Chicago
              </p>
            </div>
            <GoogleMap 
              items={restaurants} 
              center={{ lat: 41.8781, lng: -87.6298 }}
              zoom={12}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurants;