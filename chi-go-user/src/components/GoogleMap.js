import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

const GoogleMap = ({ items, center = { lat: 41.8781, lng: -87.6298 }, zoom = 12 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Listen for Google Maps load event
    const handleGoogleMapsLoad = () => {
      setIsLoaded(true);
    };

    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoad);

    return () => {
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoad);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for items
      items.forEach((item, index) => {
        if (item.location && item.location.lat && item.location.lng) {
          const position = {
            lat: parseFloat(item.location.lat),
            lng: parseFloat(item.location.lng)
          };

          const marker = new window.google.maps.Marker({
            position: position,
            map: map,
            title: item.name,
            animation: window.google.maps.Animation.DROP,
            icon: {
              url: item.itemType === 'restaurant' || item.cuisine
                ? 'https://maps.google.com/mapfiles/ms/icons/restaurant.png'
                : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });

          // Create info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                  <img 
                    src="${item.image}" 
                    alt="${item.name}"
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0;"
                    onerror="this.src='https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=60&h=60&fit=crop'"
                  />
                  <div style="flex: 1; min-width: 0;">
                    <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.2;">
                      ${item.name}
                    </h3>
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280; line-height: 1.3;">
                      ${item.description || ''}
                    </p>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                      ${item.category ? `<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 12px; font-size: 11px; font-weight: 500;">${item.category}</span>` : ''}
                      ${item.cuisine ? `<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 12px; font-size: 11px; font-weight: 500;">${item.cuisine}</span>` : ''}
                    </div>
                    <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.2;">
                      📍 ${item.location.address || 'Chicago, IL'}
                    </p>
                  </div>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            // Close all other info windows
            markersRef.current.forEach(m => {
              if (m.infoWindow) {
                m.infoWindow.close();
              }
            });
            infoWindow.open(map, marker);
          });

          // Store reference to info window
          marker.infoWindow = infoWindow;
          markersRef.current.push(marker);
        }
      });

      // Fit bounds to show all markers if there are multiple items
      if (items.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        markersRef.current.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        map.fitBounds(bounds);
        
        // Ensure minimum zoom level
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }

    // Cleanup function
    return () => {
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
    };
  }, [items, center, zoom, isLoaded]);

  // Show loading or placeholder while Google Maps loads
  if (!isLoaded) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading Google Maps...</p>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} location{items.length !== 1 ? 's' : ''} to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg overflow-hidden shadow-md"
        style={{ minHeight: '384px' }}
      />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-3 py-2">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {items.length} location{items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;