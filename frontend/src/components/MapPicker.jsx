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

const MapPicker = ({ onLocationSelect, initialLocation = null }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    try {
      // Initialize map
      const map = L.map(mapRef.current).setView([12.9716, 77.5946], 13)
      mapInstanceRef.current = map

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Create custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
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
  }, [onLocationSelect, initialLocation])

  if (error) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-600">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Unable to load map</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-96 rounded-lg border border-gray-200 shadow-sm"
        style={{ minHeight: '384px' }}
      />
      <div className="mt-2 text-xs text-gray-500 text-center">
        Click on the map to select location
      </div>
    </div>
  )
}

export default MapPicker