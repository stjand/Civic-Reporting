// File: frontend/src/components/MapViewComponent.jsx
import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getMarkerColor = (status) => {
  const colors = {
    'new': 'red',
    'in_progress': 'yellow',
    'resolved': 'green',
    'acknowledged': 'blue'
  };
  return colors[status] || 'gray';
};

const MapViewComponent = ({ reports, selectedReport, onReportSelect }) => {
  // Use a ref to control the map instance
  const mapRef = useRef();
  const [center, setCenter] = useState([17.4239, 78.4738]); // Default center

  useEffect(() => {
    if (selectedReport && selectedReport.latitude && selectedReport.longitude) {
      const newCenter = [selectedReport.latitude, selectedReport.longitude];
      if (mapRef.current) {
        mapRef.current.setView(newCenter, 15);
      }
    }
  }, [selectedReport]);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        whenCreated={mapInstance => { mapRef.current = mapInstance }}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {reports.map((report) => {
          if (!report.latitude || !report.longitude) {
            return null;
          }
          
          const position = [report.latitude, report.longitude];
          const isSelected = selectedReport?.id === report.id;
          const markerColor = getMarkerColor(report.status);

          return (
            <Marker
              key={report.id}
              position={position}
              eventHandlers={{ click: () => onReportSelect(report) }}
              icon={L.divIcon({
                className: `custom-div-icon`,
                html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -20]
              })}
            >
              <Popup>
                <div className="font-semibold">{report.title}</div>
                <div>Status: {report.status.replace('_', ' ')}</div>
                <button
                  className="mt-2 text-blue-600 hover:underline"
                  onClick={() => onReportSelect(report)}
                >
                  View Details
                </button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-sm font-semibold mb-2">Status</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>New</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapViewComponent;