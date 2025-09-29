// File: frontend/src/components/MapPicker.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Loader2 } from 'lucide-react';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// A helper component to handle map events like clicks and location found
const MapEvents = ({ onLocationSelect, initialPosition }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
    locationfound(e) {
      onLocationSelect(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // This effect will fly to the position if it's updated from the parent
  useEffect(() => {
    if (initialPosition) {
      map.flyTo(initialPosition, map.getZoom());
    }
  }, [initialPosition, map]);

  return null;
};

const MapPicker = ({ onLocationSelect, initialLocation = null, isFullscreen = false }) => {
  const [position, setPosition] = useState(initialLocation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPosition(initialLocation);
    setLoading(false); // Assume loading is done once we have an initial location or null
  }, [initialLocation]);

  const handleLocationSelect = async (latlng) => {
    setPosition(latlng);
    try {
      // Reverse geocode to get the address using Nominatim
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      if (!response.ok) throw new Error('Failed to fetch address');
      const data = await response.json();
      onLocationSelect(latlng, data.display_name || 'Address not found');
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      onLocationSelect(latlng, 'Could not fetch address');
      setError('Could not fetch address details.');
    }
  };
  
  if (error) {
    return (
      <div className={`w-full ${isFullscreen ? 'h-full' : 'h-96'} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-600">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Unable to load map</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
     <div className={`relative w-full rounded-lg border border-gray-200 shadow-sm ${isFullscreen ? 'h-full' : 'h-96'}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <MapContainer 
        center={position || [17.3850, 78.4867]} // Default to Hyderabad if no position
        zoom={13} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        whenCreated={() => setLoading(false)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents onLocationSelect={handleLocationSelect} initialPosition={position} />
        {position && <Marker position={position}></Marker>}
      </MapContainer>
    </div>
  );
};

export default MapPicker;