
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import { attractionsAPI, checklistAPI } from '../services/api';
import { useAuth } from '../components/AuthContext';

const Attractions = () => {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const getAttractionId = (attraction) => attraction._id || attraction.id || `${attraction.name}_${attraction.category}`;

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await attractionsAPI.getAll();
      setAttractions(response.data);
    } catch (err) {
      setError('Failed to load attractions');
      setAttractions([]);
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
    fetchAttractions();
    if (user) fetchChecklist();
    // eslint-disable-next-line
  }, [user]);

  const isInChecklist = (attraction) => {
    const aid = getAttractionId(attraction);
    return checklist.some(item => item.itemId === aid && item.itemType === 'attraction');
  };

  const addToChecklist = async (attraction) => {
    if (!user) {
      alert('Please login to add to your checklist');
      return;
    }
    const item = {
      itemId: getAttractionId(attraction),
      itemType: 'attraction',
      name: attraction.name,
      description: attraction.description,
      image: attraction.image,
      location: attraction.location,
      category: attraction.category,
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


  // Remove an attraction from the checklist using the backend API (same as Restaurants page)
  const removeFromChecklist = async (attraction) => {
    if (!user) return;
    try {
      setLoading(true);
      await checklistAPI.remove(user.id, getAttractionId(attraction), 'attraction');
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
          <p className="text-gray-600">Loading attractions...</p>
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
            onClick={fetchAttractions}
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
          <h1 className="text-3xl font-bold text-gray-900">Explore Chicago Attractions</h1>
          <div className="text-sm text-gray-600">
            {checklist.filter(item => item.itemType === 'attraction').length} attractions in your checklist
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attractions List */}
          <div className="space-y-6">
            {attractions.map((attraction) => (
              <div key={getAttractionId(attraction)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img 
                      src={attraction.image} 
                      alt={attraction.name}
                      className="w-32 h-32 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&h=300&fit=crop';
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {attraction.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {attraction.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {attraction.description}
                    </p>
                    {attraction.location?.address && (
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin size={12} className="mr-1" />
                        <span className="truncate">{attraction.location.address}</span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => isInChecklist(attraction)
                          ? removeFromChecklist(attraction)
                          : addToChecklist(attraction)
                        }
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isInChecklist(attraction)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {isInChecklist(attraction) ? (
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
            {attractions.length === 0 && (
              <div className="text-center py-12">
                <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No attractions found</h3>
                <p className="text-gray-600">Check back later for new attractions!</p>
              </div>
            )}
          </div>
          {/* Map */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attractions Map</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore {attractions.length} attractions across Chicago
              </p>
            </div>
            <GoogleMap 
              items={attractions} 
              center={{ lat: 41.8781, lng: -87.6298 }}
              zoom={12}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attractions;