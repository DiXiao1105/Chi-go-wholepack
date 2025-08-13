import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, MapPin, Search } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { mockAttractions, mockRestaurants, mockCommunityPosts } from '../data/mockData';
import { adminAPI } from '../services/api';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('attractions');
  const [attractions, setAttractions] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    setLoading(true);
    try {
      // Use mock data in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAttractions(mockAttractions);
        setRestaurants(mockRestaurants);
        setPosts(mockCommunityPosts);
      } else {
        // Production API calls would go here
        setAttractions(mockAttractions);
        setRestaurants(mockRestaurants);
        setPosts(mockCommunityPosts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAttractions(mockAttractions);
      setRestaurants(mockRestaurants);
      setPosts(mockCommunityPosts);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
    setShowModal(false);
  };

  const openAddModal = (type) => {
    setEditingItem(null);
    if (type === 'attraction') {
      setFormData({
        name: '',
        description: '',
        image: '',
        category: '',
        location: { lat: '', lng: '', address: '' },
        isActive: true
      });
    } else if (type === 'restaurant') {
      setFormData({
        name: '',
        description: '',
        image: '',
        cuisine: '',
        location: { lat: '', lng: '', address: '' },
        isActive: true
      });
    }
    setShowModal(true);
  };

  const openEditModal = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!formData.name || !formData.description) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingItem) {
        const updatedItem = { ...formData, _id: editingItem._id, updatedAt: new Date() };
        
        if (editingItem.type === 'attraction') {
          setAttractions(prev => prev.map(item => 
            item._id === editingItem._id ? updatedItem : item
          ));
        } else if (editingItem.type === 'restaurant') {
          setRestaurants(prev => prev.map(item => 
            item._id === editingItem._id ? updatedItem : item
          ));
        }
      } else {
        const newItem = {
          ...formData,
          _id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        if (activeTab === 'attractions') {
          setAttractions(prev => [...prev, newItem]);
        } else if (activeTab === 'restaurants') {
          setRestaurants(prev => [...prev, newItem]);
        }
      }
      
      alert('Changes saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      if (type === 'attraction') {
        setAttractions(prev => prev.filter(item => item._id !== id));
      } else if (type === 'restaurant') {
        setRestaurants(prev => prev.filter(item => item._id !== id));
      } else if (type === 'post') {
        setPosts(prev => prev.filter(item => item._id !== id));
      }
      
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting item');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || '' : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const filterData = (data) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    const isAttraction = activeTab === 'attractions' || editingItem?.type === 'attraction';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? 'Edit' : 'Add'} {isAttraction ? 'Attraction' : 'Restaurant'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter description..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isAttraction ? 'Category' : 'Cuisine Type'}
              </label>
              <input
                type="text"
                name={isAttraction ? 'category' : 'cuisine'}
                value={formData[isAttraction ? 'category' : 'cuisine'] || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${isAttraction ? 'category' : 'cuisine type'}...`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location?.address || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Street address, Chicago, IL"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  name="location.lat"
                  value={formData.location?.lat || ''}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="41.8781"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  name="location.lng"
                  value={formData.location?.lng || ''}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="-87.6298"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active (visible to users)
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-6">
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.description}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage attractions, restaurants, and community content</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'attractions', label: 'Attractions', count: attractions.length },
              { id: 'restaurants', label: 'Restaurants', count: restaurants.length },
              { id: 'posts', label: 'Community Posts', count: posts.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={`Search ${activeTab}...`}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === 'attractions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Attractions Management</h3>
              <button
                onClick={() => openAddModal('attraction')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Attraction</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Attraction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filterData(attractions).map((attraction) => (
                    <tr key={attraction._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={attraction.image} 
                            alt={attraction.name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attraction.name}</div>
                            <div className="text-sm text-gray-500">{attraction.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {attraction.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => openEditModal(attraction, 'attraction')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(attraction._id, 'attraction')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Restaurants Management</h3>
              <button
                onClick={() => openAddModal('restaurant')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add Restaurant</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Restaurant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cuisine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filterData(restaurants).map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            src={restaurant.image} 
                            alt={restaurant.name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                            <div className="text-sm text-gray-500">{restaurant.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {restaurant.cuisine}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => openEditModal(restaurant, 'restaurant')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(restaurant._id, 'restaurant')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Community Posts Management</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filterData(posts).map((post) => (
                    <tr key={post._id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">{post.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {post.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {post.likeCount}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(post._id, 'post')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderModal()}
      </div>
    </div>
  );
};

export default AdminPanel;