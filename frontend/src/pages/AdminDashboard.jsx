import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, Search, Menu, List, Map, Filter, Bell, User, Settings,
  X, ChevronLeft, ChevronRight, Phone, Mail, Calendar, Clock,
  CheckCircle, AlertTriangle, Construction, Droplets, Zap, Trash2,
  Building2, Users, Shield, Eye, MessageSquare, Flag, RefreshCw,
  Navigation, Layers, Plus, Minus, Home, BarChart3, Mic, Camera,
  LogOut, ArrowLeft, ChevronDown, MapPinIcon, UserIcon, Loader2
} from 'lucide-react';
import { getAdminDashboard, updateReportStatus } from '../services/apiServices'; // Using real API services
import { useAuth } from '../context/AuthContext'; // Using real Auth context
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom navigation function
const navigate = (path) => {
    if (path) {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('navigate'));
    }
};

// Department configurations from your target file
const departments = [
  { id: 'all', name: 'All Reports', icon: Shield, color: 'bg-gray-600' },
  { id: 'pothole', name: 'Roads & Infrastructure', icon: Construction, color: 'bg-orange-600' },
  { id: 'garbage', name: 'Sanitation', icon: Trash2, color: 'bg-green-600' },
  { id: 'streetlight', name: 'Electrical', icon: Zap, color: 'bg-yellow-500' },
  { id: 'water_leak', name: 'Water Supply', icon: Droplets, color: 'bg-blue-600' },
  { id: 'other', name: 'Other', icon: Building2, color: 'bg-purple-600' },
];

const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'resolved': return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Resolved' };
        case 'in_progress': return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Clock, label: 'In Progress' };
        case 'acknowledged': return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle, label: 'Acknowledged' };
        case 'new':
        default: return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: AlertTriangle, label: 'New' };
    }
};

const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
        case 'high': return { color: 'text-red-600', icon: Flag, label: 'High' };
        case 'medium': return { color: 'text-yellow-600', icon: Flag, label: 'Medium' };
        case 'low':
        default: return { color: 'text-green-600', icon: Flag, label: 'Low' };
    }
}

// MapView, ListView, and ReportDetailPanel are included below the main component

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState({ reports: [], stats: {}, departments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({ department: 'all', status: 'all' });
  const [viewMode, setViewMode] = useState('map');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [disableMapInteraction, setDisableMapInteraction] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getAdminDashboard();
      setData(dashboardData.data);
    } catch (err) {
      setError(err.error || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReports = useMemo(() => {
    return (data.reports || []).filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.report_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = activeFilters.department === 'all' || report.report_type === activeFilters.department;
      const matchesStatus = activeFilters.status === 'all' || report.status === activeFilters.status;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [data.reports, searchTerm, activeFilters]);

  const handleStatusUpdate = async (reportId, updateData) => {
    try {
      await updateReportStatus(reportId, updateData);
      // Refresh all data to ensure consistency
      fetchData(); 
      // Close the detail panel after update
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Error updating report: ${error.error || 'Please try again.'}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-600"/></div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-center">
        <div>
            <p className="text-red-600 text-lg font-semibold">Failed to load dashboard</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"><RefreshCw className="w-4 h-4 mr-2"/>Retry</button>
        </div>
    </div>;
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">CivicReport Admin Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700 relative"><Bell className="w-5 h-5"/><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-gray-600"/></div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name || 'Admin'}</span>
          </div>
          <button onClick={logout} title="Sign Out" className="text-gray-500 hover:text-gray-700"><LogOut className="w-5 h-5"/></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 p-4 space-y-6 hidden md:flex flex-col">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
            <div className="relative mt-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
              <input type="text" placeholder="By title or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">View Mode</label>
            <div className="flex space-x-2 mt-1">
               <button onClick={() => setViewMode('map')} className={`flex-1 p-2 rounded-md text-sm flex items-center justify-center space-x-2 ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                   <Map className="w-4 h-4"/><span>Map</span>
               </button>
               <button onClick={() => setViewMode('list')} className={`flex-1 p-2 rounded-md text-sm flex items-center justify-center space-x-2 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                   <List className="w-4 h-4"/><span>List</span>
               </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Filters</label>
            <div className="mt-2 space-y-2">
                <select onChange={(e) => setActiveFilters(f => ({...f, department: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select onChange={(e) => setActiveFilters(f => ({...f, status: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">Reports ({filteredReports.length})</h3>
             <div className="mt-2 space-y-2">
                {filteredReports.map(report => (
                    <div key={report.report_id} onClick={() => setSelectedReport(report)} className={`p-3 rounded-lg cursor-pointer border ${selectedReport?.report_id === report.report_id ? 'bg-blue-50 border-blue-400' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>
                        <p className="font-semibold text-sm text-gray-800 truncate">{report.title}</p>
                        <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs font-medium ${getStatusConfig(report.status).color}`}>{getStatusConfig(report.status).label}</span>
                            <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          <div className="flex-1 h-full">
            {viewMode === 'map' ? (
              <MapView
                reports={filteredReports}
                selectedReport={selectedReport}
                onReportSelect={setSelectedReport}
                disableInteraction={disableMapInteraction}
              />
            ) : (
              <ListView
                reports={filteredReports}
                onReportSelect={setSelectedReport}
                selectedReport={selectedReport}
              />
            )}
          </div>

          {/* Detail Panel - Desktop */}
          {selectedReport && !isMobile && (
            <div className="w-96 border-l border-gray-200 bg-white overflow-hidden">
              <ReportDetailPanel
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onStatusUpdate={handleStatusUpdate}
                isMobile={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel - Mobile (Full Screen Modal) */}
      {selectedReport && isMobile && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedReport(null)}
            aria-hidden="true"
          />
          <ReportDetailPanel
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onStatusUpdate={handleStatusUpdate}
            isMobile={true}
          />
        </>
      )}
    </div>
  );
};


// Sub-components are included in the same file as per the target file structure

const MapView = ({ reports, selectedReport, onReportSelect }) => {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && selectedReport) {
      mapRef.current.flyTo([selectedReport.latitude, selectedReport.longitude], 15);
    }
  }, [selectedReport]);

  const getMarkerIcon = (status) => {
    const color = {
        'new': '#EF4444',
        'acknowledged': '#F59E0B',
        'in_progress': '#3B82F6',
        'resolved': '#10B981',
    }[status] || '#6B7280';
    
    return L.divIcon({
        html: `<svg viewBox="0 0 24 24" width="24" height="24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
        className: 'bg-transparent border-0',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
    });
  };

  return (
    <MapContainer ref={mapRef} center={[17.3850, 78.4867]} zoom={12} className="h-full w-full z-10">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      {reports.map(report => (
        <Marker 
          key={report.report_id} 
          position={[report.latitude, report.longitude]}
          icon={getMarkerIcon(report.status)}
          eventHandlers={{ click: () => onReportSelect(report) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{report.title}</p>
              <p>{getStatusConfig(report.status).label}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

const ListView = ({ reports, onReportSelect, selectedReport }) => (
  <div className="h-full overflow-y-auto bg-white">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {reports.map(report => (
          <tr key={report.report_id} onClick={() => onReportSelect(report)} className={`cursor-pointer ${selectedReport?.report_id === report.report_id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
            <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate" style={{maxWidth: '200px'}}>{report.title}</td>
            <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusConfig(report.status).bgColor} ${getStatusConfig(report.status).color}`}>{getStatusConfig(report.status).label}</span>
            </td>
            <td className="px-6 py-4 text-sm">
                 <span className={`font-semibold ${getPriorityConfig(report.priority).color}`}>{getPriorityConfig(report.priority).label}</span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ReportDetailPanel = ({ report, onClose, onStatusUpdate, isMobile }) => {
  const [status, setStatus] = useState(report.status);
  const [priority, setPriority] = useState(report.priority);

  const handleUpdate = () => {
    onStatusUpdate(report.report_id, { status, priority });
  };
  
  const PanelWrapper = ({ children }) => 
    isMobile 
      ? <div className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white z-50 rounded-t-2xl shadow-2xl flex flex-col">{children}</div>
      : <div className="h-full flex flex-col">{children}</div>;

  return (
    <PanelWrapper>
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800">Report Details</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-600"/></button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {report.photo_url && <img src={report.photo_url} alt="Report evidence" className="rounded-lg w-full h-48 object-cover"/>}
        <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.description}</p>
        
        <div className="text-sm space-y-2 border-t pt-4">
            <div className="flex"><strong className="w-24 inline-block text-gray-500">ID:</strong> <span className="font-mono text-xs">{report.report_id}</span></div>
            <div className="flex"><strong className="w-24 inline-block text-gray-500">Category:</strong> <span>{report.report_type}</span></div>
            <div className="flex"><strong className="w-24 inline-block text-gray-500">Address:</strong> <span>{report.address}</span></div>
            <div className="flex"><strong className="w-24 inline-block text-gray-500">Submitted:</strong> <span>{new Date(report.created_at).toLocaleString()}</span></div>
        </div>
        
        <div className="border-t pt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Update Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="new">New</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
            </select>
        </div>
         <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Update Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
        </div>
      </div>
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <button onClick={handleUpdate} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">Update Report</button>
      </div>
    </PanelWrapper>
  );
};

export default AdminDashboard;