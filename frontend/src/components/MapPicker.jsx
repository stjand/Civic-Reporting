// File: frontend/src/components/MapPicker.jsx
import React, { useRef, useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Loader2 } from 'lucide-react'

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapPicker = ({ onLocationSelect, initialLocation = null, isFullscreen = false }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    try {
      // Initialize map
      const map = L.map(mapRef.current).setView([17.3850, 78.4867], 13)
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Create custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg ${isFullscreen ? 'animate-pulse' : ''}"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -12]
      })

      // Add click event listener
      map.on('click', (e) => {
        const { lat, lng } = e.latlng
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }
        
        // Add new marker
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
        markerRef.current = marker
        
        // Notify parent component
        onLocationSelect({ lat, lng })
      })

      // Set initial location if provided
      if (initialLocation) {
        const marker = L.marker([initialLocation.lat, initialLocation.lng], { icon: customIcon }).addTo(map)
        markerRef.current = marker
        map.setView([initialLocation.lat, initialLocation.lng], 15)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Failed to load map')
      setLoading(false)
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onLocationSelect, initialLocation, isFullscreen])

  // Handle fullscreen resize
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize()
      }, 100)
    }
  }, [isFullscreen])

  if (error) {
    return (
      <div className={`w-full ${isFullscreen ? 'h-full' : 'h-96'} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-600">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Unable to load map</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullscreen ? 'h-full' : ''}`}>
      {loading && (
        <div className={`absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10 ${isFullscreen ? 'h-full' : ''}`}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={`w-full rounded-lg border border-gray-200 shadow-sm ${
          isFullscreen ? 'h-full' : 'h-96'
        }`}
        style={{ minHeight: isFullscreen ? '100%' : '384px' }}
      />
      <div className={`${isFullscreen ? 'absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg' : 'mt-2'} text-xs text-gray-500 text-center`}>
        {isFullscreen ? '📍 Tap anywhere on the map to set location' : 'Click on the map to select location'}
      </div>
    </div>
  )
}

export default MapPicker