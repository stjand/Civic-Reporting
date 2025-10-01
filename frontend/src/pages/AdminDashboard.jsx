import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    MapPin, Search, User, X, Clock, CheckCircle, AlertTriangle,
    Construction, Droplets, Zap, Trash2, Building2, Shield, Eye, Flag, RefreshCw,
    LogOut, Loader2, Activity, FileText, Camera, Calendar, Filter,
    BarChart3, Layers, TrendingUp, List, MapIcon, Info, Send, RotateCcw
} from 'lucide-react';
// --- REAL MAP IMPORTS ---
// NOTE: If compilation fails here, ensure react-leaflet, leaflet, and leaflet.css are installed in your project.
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- REAL SERVICE IMPORTS ---
import { getAdminDashboard, updateReportStatus, getOfficialsList } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';

// CONFIGURATION
const DEFAULT_MAP_CENTER = [17.3850, 78.4867];
const DEFAULT_MAP_ZOOM = 12;

// API Base URL definition for environment variable access
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Base URL for assets, ensuring consistency
const ASSET_BASE_URL = API_BASE_URL.replace('/api', '');

// Fix for Leaflet marker icons in React (Standard fix)
if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
}

const DEPARTMENTS = [
    { id: 'all', name: 'All Reports', icon: Shield, color: 'bg-slate-600', gradient: 'from-slate-500 to-slate-700' },
    { id: 'road_maintenance', name: 'Roads & Infrastructure', icon: Construction, color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
    { id: 'waste_management', name: 'Sanitation & Waste', icon: Trash2, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'street_lighting', name: 'Street Lighting', icon: Zap, color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600' },
    { id: 'water_infrastructure', name: 'Water Supply', icon: Droplets, color: 'bg-cyan-500', gradient: 'from-cyan-500 to-cyan-600' },
    { id: 'other_issues', name: 'Other Issues', icon: Building2, color: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600' },
];

const STATUS_CONFIG = {
    resolved: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Resolved', markerColor: '#10b981' },
    in_progress: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'In Progress', markerColor: '#3b82f6' },
    acknowledged: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Eye, label: 'Acknowledged', markerColor: '#f59e0b' },
    new: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle, label: 'New', markerColor: '#f43f5e' },
};

const PRIORITY_CONFIG = {
    high: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: 'High', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
    medium: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Medium', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Low', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

// UTILITY COMPONENTS
const MapFlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position?.[0] && position?.[1]) {
            map.flyTo(position, 16, { duration: 1.2 });
        }
    }, [position, map]);
    return null;
};

// MODAL COMPONENT (Replaces alert() for better UX)
const CustomModal = ({ title, message, onClose }) => (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transition-all duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 mb-6">{message}</p>
            <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
                Close
            </button>
        </div>
    </div>
);

// IMAGE MODAL COMPONENT
const ImageModal = ({ imageUrl, onClose }) => {
    return (
        <div className="fixed inset-0 z-[800] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-6 h-6 text-white" />
            </button>
            <img
                src={imageUrl}
                alt="Report Evidence"
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Image failed to load.');
                }}
            />
        </div>
    );
};

// REPORT DETAILS PANEL
const ReportDetailsPanel = ({ report, onClose, onStatusUpdate, officials, fetchData }) => {
    const [status, setStatus] = useState(report.status);
    const [priority, setPriority] = useState(report.priority);
    const [assignedOfficialId, setAssignedOfficialId] = useState(report.assigned_to_user_id || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
    const [showImageModal, setShowImageModal] = useState(false);

    const statusConfig = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.new;
    const priorityConfig = PRIORITY_CONFIG[priority?.toLowerCase()] || PRIORITY_CONFIG.low;
    const dept = DEPARTMENTS.find(d => d.id === report.report_type);
    const departmentOfficials = officials.filter(o => o.report_type === report.report_type);
    const hasChanges = status !== report.status || priority !== report.priority || assignedOfficialId !== (report.assigned_to_user_id || '');

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateError(null);
        try {
            await onStatusUpdate(report.report_id, { status, priority, assigned_to_user_id: assignedOfficialId || null });
            onClose();
        } catch (error) {
            setUpdateError(`Failed to update report: ${error.error || error.message || 'Please check connection.'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Helper function for URL construction safety (Fix for media paths)
    const getMediaUrl = (urlPath) => {
        if (!urlPath) return undefined;
        // Ensure only one slash between base URL and path
        const cleanedPath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
        return `${ASSET_BASE_URL}${cleanedPath}`;
    }

    return (
        <div className="fixed inset-0 lg:relative lg:w-[480px] bg-white z-[600] flex flex-col shadow-2xl transition-all duration-300 ease-out">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {dept && (
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${dept.color} shadow-lg`}>
                                <dept.icon className="w-6 h-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Report Details</h2>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{report.report_id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Status & Priority Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                        <statusConfig.icon className="w-3.5 h-3.5 mr-1.5" />
                        {statusConfig.label}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${priorityConfig.badge} border`}>
                        <Flag className="w-3.5 h-3.5 mr-1.5" />
                        {priorityConfig.label} Priority
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 flex border-b border-slate-200 bg-white px-6">
                {['details', 'actions', 'timeline'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all capitalize ${
                            activeTab === tab
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'details' && (
                    <div className="p-6 space-y-6">
                        {/* Title & Description with floating image */}
                        <div className="space-y-3">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-3">{report.title}</h3>
                                    <p className="text-base text-slate-600 leading-relaxed">{report.description}</p>
                                </div>

                                {/* Floating Image Thumbnail */}
                                {report.photo_url && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={getMediaUrl(report.photo_url)}
                                            alt="Evidence"
                                            className="w-24 h-24 object-cover rounded-2xl border-2 border-slate-200 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
                                            onClick={() => setShowImageModal(true)}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audio Evidence */}
                        {report.audio_url && (
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center mb-3">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Audio Evidence
                                </h4>
                                <audio controls src={getMediaUrl(report.audio_url)} className="w-full rounded-xl" />
                            </div>
                        )}

                        {/* Location Details */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                Location Details
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Address</p>
                                    <p className="text-sm font-semibold text-slate-900">{report.address}</p>
                                </div>
                                {report.latitude && report.longitude && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Latitude</p>
                                            <p className="text-sm font-mono text-slate-700">{parseFloat(report.latitude).toFixed(6)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Longitude</p>
                                            <p className="text-sm font-mono text-slate-700">{parseFloat(report.longitude).toFixed(6)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reporter Information */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Reporter Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Name</p>
                                    <p className="text-sm font-semibold text-slate-900">{report.user_name || 'Anonymous'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Reported On</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {new Date(report.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Info */}
                        {report.assigned_to_user_id && (
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                                <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center mb-3">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Current Assignment
                                </h4>
                                <p className="text-sm font-semibold text-blue-900">
                                    {officials.find(o => o.id === report.assigned_to_user_id)?.name || 'Unknown Official'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="p-6 space-y-5">
                        {/* Assign Official */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Assign to Official ({dept?.name})
                            </label>
                            <select
                                value={assignedOfficialId}
                                onChange={(e) => setAssignedOfficialId(e.target.value)}
                                className="w-full px-4 py-3.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition-all"
                            >
                                <option value="">-- Unassigned (Select {dept?.name.split(' ')[0]} Official) --</option>
                                {departmentOfficials.map(official => (
                                    <option key={official.id} value={official.id}>
                                        {official.name} - {official.designation}
                                    </option>
                                ))}
                                {departmentOfficials.length === 0 && <option disabled>No officials found for this department</option>}
                            </select>
                        </div>

                        {/* Update Status */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                                <Activity className="w-4 h-4 mr-2" />
                                Update Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition-all"
                            >
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Update Priority */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                                <Flag className="w-4 h-4 mr-2" />
                                Update Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-3.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition-all"
                            >
                                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label} Priority</option>
                                ))}
                            </select>
                        </div>

                        {/* Changes Summary */}
                        {hasChanges && (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <p className="text-sm font-bold text-blue-900 mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-2" />
                                    Pending Changes
                                </p>
                                <ul className="space-y-1.5 text-sm text-blue-800">
                                    {status !== report.status && (
                                        <li className="flex items-center">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                            Status: <span className="font-semibold ml-1 capitalize">{report.status.replace('_', ' ')}</span> → <span className="font-bold ml-1 capitalize">{status.replace('_', ' ')}</span>
                                        </li>
                                    )}
                                    {priority !== report.priority && (
                                        <li className="flex items-center">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                            Priority: <span className="font-semibold ml-1 capitalize">{report.priority}</span> → <span className="font-bold ml-1 capitalize">{priority}</span>
                                        </li>
                                    )}
                                    {assignedOfficialId !== (report.assigned_to_user_id || '') && (
                                        <li className="flex items-center">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                            Official assignment updated
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'timeline' && (
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-blue-600" />
                            Activity Timeline
                        </h3>
                        <div className="space-y-4">
                            {/* Report Created */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-md"></div>
                                    <div className="w-0.5 h-full bg-slate-200"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <p className="text-sm font-semibold text-slate-900 flex items-center">
                                        <Send className="w-3.5 h-3.5 mr-2 text-blue-600" />
                                        Report Submitted
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        By {report.user_name || 'Anonymous Citizen'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {new Date(report.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Latest Status Update */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-md"></div>
                                    <div className="w-0.5 h-full bg-slate-200"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <p className="text-sm font-semibold text-slate-900 flex items-center capitalize">
                                        <Activity className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                        Current Status: {report.status.replace('_', ' ')}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {report.status === 'new' ? 'Awaiting acknowledgment' : 'By System/Admin'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {new Date(report.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Save Button */}
            <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
                {updateError && (
                    <div className="p-3 mb-4 bg-rose-100 text-rose-800 rounded-xl text-sm font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {updateError}
                    </div>
                )}
                <button
                    onClick={handleUpdate}
                    disabled={!hasChanges || isUpdating}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-lg ${
                        hasChanges && !isUpdating
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {isUpdating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Updating Report...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            {hasChanges ? 'Save Changes & Notify' : 'No Changes to Save'}
                        </>
                    )}
                </button>
            </div>

            {/* Image Modal */}
            {showImageModal && report.photo_url && (
                <ImageModal
                    imageUrl={getMediaUrl(report.photo_url)}
                    onClose={() => setShowImageModal(false)}
                />
            )}
        </div>
    );
};

// LIST VIEW COMPONENT
const ListView = ({ reports, onReportSelect, searchTerm, setSearchTerm }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* FIX: Added lg:pt-24 padding here to clear the desktop floating search/view controls. */}
            <div className="flex-1 overflow-y-auto p-4 lg:pt-24 lg:px-8">
                {reports.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                            <p className="text-lg text-slate-600 font-semibold">No reports found</p>
                            <p className="text-sm text-slate-400 mt-2">Try adjusting your filters</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-5xl mx-auto pb-20"> {/* pb-20 gives space for mobile nav */}
                        {reports.map(report => {
                            const statusConfig = STATUS_CONFIG[report.status?.toLowerCase()] || STATUS_CONFIG.new;
                            const priorityConfig = PRIORITY_CONFIG[report.priority?.toLowerCase()] || PRIORITY_CONFIG.low;
                            const dept = DEPARTMENTS.find(d => d.id === report.report_type);

                            return (
                                <div
                                    key={report.report_id}
                                    onClick={() => onReportSelect(report)}
                                    className="bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Department Icon */}
                                        {dept && (
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${dept.color} shadow-md`}>
                                                <dept.icon className="w-6 h-6 text-white" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {report.title}
                                                </h3>
                                                <div className="flex-shrink-0 flex gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${priorityConfig.badge} border`}>
                                                        {priorityConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                {report.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate max-w-[200px]">{report.address}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>{report.user_name || 'Anonymous'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// MOBILE MAP RESTRICTION SCREEN
const MapRestrictionScreen = ({ onNavigate }) => {
    return (
        <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
            <div className="max-w-md text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <MapIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    Map View Restricted
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                    The interactive map is optimized for large screens. For the best experience, please use a desktop or tablet device.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => onNavigate('list')}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <List className="w-5 h-5" />
                        Back to Reports List
                    </button>
                    <button
                        onClick={() => onNavigate('analytics')}
                        className="w-full px-6 py-4 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all border-2 border-slate-200 flex items-center justify-center gap-2"
                    >
                        <TrendingUp className="w-5 h-5" />
                        View Analytics Instead
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    Best viewed on screens 1024px or larger
                </p>
            </div>
        </div>
    );
};

// MOBILE FILTER MODAL COMPONENT (Filter button is in the mobile bottom nav)
const MobileFilterModal = ({ onClose, reports, activeDepartment, setActiveDepartment, activeStatus, setActiveStatus, onResetFilters, stats, logout }) => {
    // Note: Local stats calculation uses the full 'reports' prop (data.reports)
    const localStats = useMemo(() => {
        const total = reports.length;
        const newCount = reports.filter(r => r.status === 'new').length;
        return { total, newCount };
    }, [reports]);

    // Use a list filtered by current search/status (derived from the passed stats.total or reports list)
    const filteredReportsForDisplay = useMemo(() => {
        // Since the reports prop passed here is usually data.reports (unfiltered by status/search),
        // we'll use it for departmental filtering inside the modal for consistency.
        return reports;
    }, [reports]);


    return (
        <div className="fixed inset-0 z-[700] bg-black/50 backdrop-blur-sm flex items-end lg:hidden" onClick={onClose}>
            <div className="w-full bg-white rounded-t-3xl p-6 shadow-2xl transition-all duration-300 transform translate-y-0 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-blue-600" />
                        Filter Reports
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="flex gap-3 mb-6">
                        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <p className="text-xs text-blue-700 font-semibold mb-1">Total System Reports</p>
                            <p className="text-2xl font-bold text-blue-900">{localStats.total}</p>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
                            <p className="text-xs text-rose-700 font-semibold mb-1">New</p>
                            <p className="text-2xl font-bold text-rose-900">{localStats.newCount}</p>
                        </div>
                    </div>

                    {/* Departments */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Departments</h3>
                        <div className="space-y-2">
                            {DEPARTMENTS.map(dept => {
                                // FIX: Use the stable search/status filtered total (stats.total from AdminDashboard)
                                // for the "All Reports" button count, and use the base reports list for departmental breakdown.
                                
                                const count = dept.id === 'all'
                                    ? stats.total // Use the stable, currently visible total count (based on search/status)
                                    : filteredReportsForDisplay.filter(r => r.report_type === dept.id).length;
                                    
                                const isActive = activeDepartment === dept.id;
                                return (
                                    <button
                                        key={dept.id}
                                        onClick={() => setActiveDepartment(dept.id)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                                            isActive
                                                ? `bg-gradient-to-r ${dept.gradient} text-white shadow-md`
                                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <dept.icon className="w-4 h-4" />
                                            {dept.name}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                                            isActive ? 'bg-white/20' : 'bg-slate-200'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Status</h3>
                        <div className="space-y-2">
                            {[
                                { id: 'all', name: 'All Status', icon: Layers },
                                ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                                    id: key,
                                    name: config.label,
                                    icon: config.icon
                                }))
                            ].map(status => {
                                // Status filter must operate on the department-agnostic list (reportsForCounts is not accessible directly here)
                                // Since we rely on the parent component's state update for filtering, we use the passed stats.total.
                                
                                const count = status.id === 'all'
                                    ? stats.total // Use stable total count
                                    : filteredReportsForDisplay.filter(r => r.status === status.id).length;
                                    
                                const isActive = activeStatus === status.id;

                                return (
                                    <button
                                        key={status.id}
                                        onClick={() => setActiveStatus(status.id)}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                                            isActive
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <status.icon className="w-4 h-4" />
                                            {status.name}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                                            isActive ? 'bg-white/20' : 'bg-slate-200'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                    <button
                        onClick={() => { onResetFilters(); onClose(); }}
                        className="w-1/2 px-4 py-3 rounded-xl text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={onClose}
                        className="w-1/2 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Apply Filters
                    </button>
                </div>

                {/* Mobile Sign Out Feature (Fix 3) */}
                {logout && (
                    <div className="flex justify-center pt-6 mt-6 border-t border-slate-200">
                        <button
                            onClick={logout}
                            className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-white text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-200"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ANALYTICS VIEW COMPONENT
const AnalyticsView = ({ data, filteredReports }) => {
    // Analytics is calculated on ALL reports (data.reports) for global insights
    const stats = useMemo(() => {
        const reports = data.reports || [];
        const totalReports = reports.length;
        const resolvedReports = reports.filter(r => r.status === 'resolved').length;
        const resolvedRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : 0;

        // Check for reports submitted today
        const today = new Date().toDateString();
        const newReportsToday = reports.filter(r => new Date(r.created_at).toDateString() === today).length;

        const departmentBreakdown = DEPARTMENTS.slice(1).map(dept => {
            const count = reports.filter(r => r.report_type === dept.id).length;
            return { ...dept, count };
        });

        const monthlyData = Array(12).fill(0);
        reports.forEach(report => {
            const date = new Date(report.created_at);
            if (date.getFullYear() === new Date().getFullYear()) {
                const month = date.getMonth();
                monthlyData[month]++;
            }
        });

        return { totalReports, resolvedRate, newReportsToday, departmentBreakdown, monthlyData };
    }, [data.reports]);

    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* FIX: Added lg:pt-24 padding here to push content down below the fixed header on desktop */}
            <div className="flex-1 overflow-y-auto p-4 lg:pt-24 lg:px-8 space-y-8 pb-20">
                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-blue-600 transition-shadow hover:shadow-2xl">
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Total Reports</p>
                        <p className="text-4xl font-bold text-slate-900 mt-2">{stats.totalReports.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">Overall received reports</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-emerald-600 transition-shadow hover:shadow-2xl">
                        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Resolution Rate</p>
                        <p className="text-4xl font-bold text-slate-900 mt-2">{stats.resolvedRate}%</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved vs Total
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-rose-600 transition-shadow hover:shadow-2xl">
                        <p className="text-sm font-semibold text-rose-600 uppercase tracking-wider">New Today</p>
                        <p className="text-4xl font-bold text-slate-900 mt-2">{stats.newReportsToday}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            Requires attention
                        </p>
                    </div>
                </div>

                {/* Report Trend Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-slate-500" />
                        Monthly Report Submission Trend ({new Date().getFullYear()})
                    </h3>
                    <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <div className="flex w-full items-end h-full p-4 gap-2">
                            {stats.monthlyData.map((count, index) => {
                                const maxCount = Math.max(...stats.monthlyData, 1);
                                const height = (count / maxCount) * 100;
                                return (
                                    <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                                        {count > 0 && <div className="text-xs font-semibold text-slate-700 mb-1">{count}</div>}
                                        <div
                                            className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-md"
                                            style={{ height: count > 0 ? `${height}%` : '2%', minHeight: count > 0 ? '8px' : '2px' }}
                                            title={`${chartLabels[index]}: ${count}`}
                                        ></div>
                                        <div className="text-xs text-slate-500 mt-1">{chartLabels[index]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Department Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Reports by Department</h3>
                    <div className="space-y-4">
                        {stats.departmentBreakdown.map((dept, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                                <span className="text-base font-medium text-slate-700 w-40 truncate">{dept.name}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-3">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${dept.gradient}`}
                                        style={{ width: stats.totalReports > 0 ? `${(dept.count / stats.totalReports) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <span className="font-bold text-slate-900 text-sm w-12 text-right">{dept.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// MAIN COMPONENT
const AdminDashboard = () => {
    // --- Context and Data Hooks ---
    const { user, logout } = useAuth();
    // Using a state for isDesktop ensures reactivity outside of the resize listener
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const [data, setData] = useState({ reports: [], stats: {} });
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);

    // --- UI State Hooks ---
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDepartment, setActiveDepartment] = useState('all');
    const [activeStatus, setActiveStatus] = useState('all');

    // Default view mode: 'map' for desktop, 'list' for mobile
    const [viewMode, setViewMode] = useState(isDesktop ? 'map' : 'list');

    // Desktop sidebar is kept open by default for filters
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);


    // NEW MEMO (1) Base list filtered by Search Term and Status ONLY (Department-agnostic)
    const reportsForCounts = useMemo(() => {
        let reports = data.reports || [];
        const term = searchTerm.toLowerCase().trim();

        return reports.filter(report => {
            const matchesSearch = !term ||
                report.title?.toLowerCase().includes(term) ||
                report.report_id?.toLowerCase().includes(term) ||
                report.description?.toLowerCase().includes(term) ||
                report.address?.toLowerCase().includes(term);

            const matchesStatus = activeStatus === 'all' || report.status === activeStatus;

            return matchesSearch && matchesStatus;
        });
    }, [data.reports, searchTerm, activeStatus]);


    // UPDATE MEMO (2) Final list filtered by Search, Status, AND activeDepartment
    const filteredReports = useMemo(() => {
        let reports = reportsForCounts; // Start with the list filtered by search/status

        // Apply Department filter ONLY at this stage
        return activeDepartment === 'all'
            ? reports
            : reports.filter(report => report.report_type === activeDepartment);

    }, [reportsForCounts, activeDepartment]);

    // UPDATE MEMO (3) Stats object uses the department-agnostic list length for stable counts
    const stats = useMemo(() => {
        const total = reportsForCounts.length; // FIX: Stable total based on search/status filters
        const newCount = reportsForCounts.filter(r => r.status === 'new').length;
        const inProgress = reportsForCounts.filter(r => r.status === 'in_progress').length;
        const resolved = reportsForCounts.filter(r => r.status === 'resolved').length;
        return { total, newCount, inProgress, resolved };
    }, [reportsForCounts]); // Dependency changed

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // --- USING REAL API SERVICES ---
            const [dashboardResponse, officialsResponse] = await Promise.all([
                getAdminDashboard(),
                getOfficialsList()
            ]);

            // Assuming the response structure is { data: { reports: [...] } } or { reports: [...] }
            const dashboardData = dashboardResponse.data || dashboardResponse;
            const reports = dashboardData.reports || [];
            const officialsData = officialsResponse.officials || [];

            setData({ reports, stats: dashboardData.stats || {} });
            setOfficials(officialsData);
            setError(null);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            // Ensure error message is passed correctly for display
            setError(err.error || err.message || 'Failed to fetch dashboard data. Check API services.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    // --- Responsive Logic ---
    useEffect(() => {
        const handleResize = () => {
            const newIsDesktop = window.innerWidth >= 1024;
            setIsDesktop(newIsDesktop); // Update the state
            setDesktopSidebarOpen(newIsDesktop);

            // If screen size changes:
            if (!newIsDesktop && viewMode === 'map') {
                setViewMode('map_restricted'); // Mobile restriction screen
            } else if (newIsDesktop && viewMode === 'map_restricted') {
                 // Transitioning back to desktop
                setViewMode('map');
            }
        };
        // Initial setup and listener
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]); // Depend on viewMode to re-evaluate if restriction is needed

    const handleStatusUpdate = useCallback(async (reportId, updateData) => {
        try {
            // --- USING REAL API SERVICES ---
            await updateReportStatus(reportId, updateData);
            await fetchData();
            setSelectedReport(null);
            setShowUpdateSuccessModal(true);
        } catch (error) {
            console.error("Failed to update status:", error);
            // Re-throw to be caught by the panel component for local error display
            throw error;
        }
    }, [fetchData]);

    const handleViewModeChange = (mode) => {
        const currentIsDesktop = window.innerWidth >= 1024;

        // If trying to switch to 'map' on mobile, set to restricted mode.
        if (mode === 'map' && !currentIsDesktop) {
            setViewMode('map_restricted');
            return;
        }
        setViewMode(mode);
    };

    const handleResetFilters = useCallback(() => {
        setSearchTerm('');
        setActiveDepartment('all');
        setActiveStatus('all');
    }, []);

    // --- Loading and Error Screens ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-700 font-semibold text-lg">Loading Dashboard</p>
                    <p className="text-slate-500 text-sm mt-2">Fetching latest reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-rose-200">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-rose-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Connection Failed</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center mx-auto"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const isMapRestricted = viewMode === 'map_restricted';

    return (
        <div className="h-screen w-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden font-sans">
            {/* Inline CSS for Leaflet z-index conflicts */}
            <style>{`.leaflet-container { z-index: 10; }`}</style>

            {/* DESKTOP SIDEBAR (Filters & Stats) - Hidden completely on mobile */}
            {isDesktop && (
                <div className={`flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${
                    desktopSidebarOpen ? 'w-80' : 'w-20'
                    }`}>

                    {/* Header */}
                    <div className="flex-shrink-0 p-6 border-b border-slate-200 bg-gradient-to-br from-white to-slate-50">
                        <div className="flex items-center justify-between mb-6">
                            {desktopSidebarOpen ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                            <Shield className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-base font-bold text-slate-900">CivicReport</h1>
                                            <p className="text-xs text-slate-500">Admin Panel</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDesktopSidebarOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                        title="Collapse Sidebar"
                                    >
                                        <X className="w-5 h-5 text-slate-600 rotate-180" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setDesktopSidebarOpen(true)}
                                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg mx-auto"
                                    title="Expand Sidebar"
                                >
                                    <Shield className="w-6 h-6 text-white" />
                                </button>
                            )}
                        </div>

                        {desktopSidebarOpen && (
                            <div className="flex gap-3">
                                <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                    <p className="text-xs text-blue-700 font-semibold mb-1">Total</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                </div>
                                <div className="flex-1 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
                                    <p className="text-xs text-rose-700 font-semibold mb-1">New</p>
                                    <p className="text-2xl font-bold text-rose-900">{stats.newCount}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex-1 overflow-y-auto">
                        {desktopSidebarOpen ? (
                            <div className="p-6 space-y-6">
                                {/* Departments */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Departments</h3>
                                    <div className="space-y-2">
                                        {DEPARTMENTS.map(dept => {
                                            const count = dept.id === 'all'
                                                ? stats.total // FIX: Use stable search/status filtered total
                                                : filteredReports.filter(r => r.report_type === dept.id).length;
                                            const isActive = activeDepartment === dept.id;

                                            return (
                                                <button
                                                    key={dept.id}
                                                    onClick={() => setActiveDepartment(dept.id)}
                                                    className={`w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                                                        isActive
                                                            ? `bg-gradient-to-r ${dept.gradient} text-white shadow-lg`
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <dept.icon className="w-5 h-5" />
                                                        <span>{dept.name}</span>
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                                                        isActive ? 'bg-white/20' : 'bg-slate-100'
                                                        }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Status</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'all', name: 'All Status', icon: Layers },
                                            ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                                                id: key,
                                                name: config.label,
                                                icon: config.icon
                                            }))
                                        ].map(status => {
                                            // Status filter must operate on the department-agnostic list (reportsForCounts)
                                            const count = status.id === 'all'
                                                ? stats.total
                                                : reportsForCounts.filter(r => r.status === status.id).length;

                                            const isActive = activeStatus === status.id;

                                            return (
                                                <button
                                                    key={status.id}
                                                    onClick={() => setActiveStatus(status.id)}
                                                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                                                        isActive
                                                            ? 'bg-slate-900 text-white shadow-md'
                                                            : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <status.icon className="w-4 h-4" />
                                                        <span>{status.name}</span>
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                                                        isActive ? 'bg-white/20' : 'bg-slate-100'
                                                        }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-6 border-t border-slate-200 space-y-3">
                                    <button
                                        onClick={handleResetFilters}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-200"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset Filters
                                    </button>
                                    <button
                                        onClick={fetchData}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 space-y-3">
                                {DEPARTMENTS.slice(0, 6).map(dept => (
                                    <button
                                        key={dept.id}
                                        onClick={() => setActiveDepartment(dept.id)}
                                        className={`w-full p-3 rounded-xl transition-all ${
                                            activeDepartment === dept.id
                                                ? `bg-gradient-to-r ${dept.gradient} text-white shadow-lg`
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        title={dept.name}
                                    >
                                        <dept.icon className="w-6 h-6 mx-auto" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - User Info */}
                    <div className="flex-shrink-0 p-6 border-t border-slate-200">
                        {desktopSidebarOpen ? (
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                        {user?.name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-slate-500">Administrator</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={logout}
                                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md mx-auto hover:shadow-lg transition-all"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5 text-white" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden relative">

                {/* Mobile Top Bar (Simplified) */}
                <div className="lg:hidden flex-shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-start">
                    <h2 className="text-lg font-bold text-slate-900 capitalize">
                        {viewMode === 'list' || viewMode === 'map_restricted' ? 'Reports List' : viewMode === 'analytics' ? 'Analytics' : 'Map View'}
                    </h2>
                </div>

                {/* --- SEARCH BAR AND VIEW SWITCHER (Mobile Below Header, Desktop Floating) --- */}
                {/* Mobile: Takes up vertical space. Desktop: Absolute/Floating. */}
                <div className={`flex-shrink-0 z-40 ${isDesktop ? 'absolute top-0 inset-x-0 p-6 flex justify-center pointer-events-none' : 'lg:hidden p-4 bg-slate-50'}`}>
                    <div className={`flex items-center gap-4 w-full ${isDesktop ? 'max-w-5xl pointer-events-auto' : ''}`}>

                        {/* Search Bar (Functional on List/Analytics views, desktop map view) */}
                        {(viewMode === 'list' || viewMode === 'analytics' || isDesktop) && (
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by title, ID, description, or address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xl ${isDesktop && viewMode === 'map' ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'}`}
                                />
                            </div>
                        )}

                        {/* View Mode Switcher (Desktop Only - Mobile uses Bottom Nav) */}
                        {isDesktop && (
                            <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm">

                                <button
                                    onClick={() => handleViewModeChange('map')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                                    title="Switch to Map View"
                                >
                                    <MapIcon className="w-4 h-4" />
                                    <span className="hidden lg:inline">Map</span>
                                </button>

                                <button
                                    onClick={() => handleViewModeChange('list')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                                    title="Switch to List View"
                                >
                                    <List className="w-4 h-4" />
                                    <span className="hidden lg:inline">List</span>
                                </button>

                                <button
                                    onClick={() => handleViewModeChange('analytics')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${viewMode === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                                    title="Switch to Analytics"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="hidden lg:inline">Analytics</span>
                                </button>

                            </div>
                        )}
                    </div>
                </div>


                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {isMapRestricted ? (
                        <MapRestrictionScreen onNavigate={handleViewModeChange} />
                    ) : viewMode === 'map' ? (
                        <>
                            {/* Map Container: Full height, overlaid by absolute controls */}
                            <div className="h-full w-full">
                                <MapContainer
                                    center={DEFAULT_MAP_CENTER}
                                    zoom={DEFAULT_MAP_ZOOM}
                                    className="h-full w-full z-10"
                                    zoomControl={false}
                                    whenCreated={map => typeof L !== 'undefined' && map.whenReady(() => map.invalidateSize())}
                                >
                                    {/* CRITICAL FIX: TileLayer loads the map images/tiles */}
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap'
                                    />

                                    {selectedReport?.latitude && selectedReport?.longitude && (
                                        <MapFlyTo position={[selectedReport.latitude, selectedReport.longitude]} />
                                    )}

                                    {filteredReports.map(report => {
                                        if (!report.latitude || !report.longitude || typeof L === 'undefined') return null;
                                        const statusConfig = STATUS_CONFIG[report.status?.toLowerCase()] || STATUS_CONFIG.new;
                                        const isSelected = selectedReport?.report_id === report.report_id;

                                        const markerIcon = L.divIcon({
                                            html: `<div class="${isSelected ? 'animate-bounce' : ''}">
                                                    <svg viewBox="0 0 24 24" width="${isSelected ? '40' : '32'}" height="${isSelected ? '40' : '32'}"
                                                        fill="${statusConfig.markerColor}" xmlns="http://www.w3.org/2000/svg"
                                                        style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                    </svg>
                                                </div>`,
                                            className: '',
                                            iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
                                            iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
                                        });

                                        return (
                                            <Marker
                                                key={report.report_id}
                                                position={[report.latitude, report.longitude]}
                                                icon={markerIcon}
                                                eventHandlers={{
                                                    click: () => setSelectedReport(report),
                                                }}
                                            />
                                        );
                                    })}
                                </MapContainer>
                            </div>

                            {/* Map Legend */}
                            <div className="absolute bottom-8 left-6 z-20 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-slate-200 hidden lg:block">
                                <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center">
                                    <Layers className="w-4 h-4 mr-2" />
                                    Status Legend
                                </h4>
                                <div className="space-y-2.5">
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                                                style={{ backgroundColor: config.markerColor }}
                                            />
                                            <span className="text-sm font-medium text-slate-700">
                                                {config.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : viewMode === 'list' ? (
                        <ListView
                            reports={filteredReports}
                            onReportSelect={setSelectedReport}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                        />
                    ) : (
                        <AnalyticsView data={data} filteredReports={filteredReports} />
                    )}
                </div>
            </div>

            {/* REPORT DETAILS PANEL */}
            {selectedReport && (
                <ReportDetailsPanel
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onStatusUpdate={handleStatusUpdate}
                    officials={officials}
                    fetchData={fetchData}
                />
            )}

            {/* MOBILE FILTER MODAL */}
            {isFilterModalOpen && (
                <MobileFilterModal
                    onClose={() => setIsFilterModalOpen(false)}
                    reports={data.reports} // Full list for calculating overall system stats
                    activeDepartment={activeDepartment}
                    setActiveDepartment={setActiveDepartment}
                    activeStatus={activeStatus}
                    setActiveStatus={setActiveStatus}
                    onResetFilters={handleResetFilters}
                    stats={stats} // Pass the department-agnostic stats object
                    logout={logout} // Pass logout function for mobile sign-out
                />
            )}

            {/* SUCCESS MODAL */}
            {showUpdateSuccessModal && (
                <CustomModal
                    title="Update Successful"
                    message="The report status and assignment have been updated successfully."
                    onClose={() => setShowUpdateSuccessModal(false)}
                />
            )}

            {/* Mobile Bottom Navigation (Filter Button opens the Modal) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-2xl">
                <div className="grid grid-cols-3 gap-2 p-3">
                    <button
                        onClick={() => handleViewModeChange('list')}
                        className={`flex flex-col items-center py-3 rounded-xl transition-all ${
                            viewMode === 'list' || viewMode === 'map_restricted'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <List className="w-5 h-5 mb-1" />
                        <span className="text-xs font-semibold">Reports</span>
                    </button>

                    {/* Map View Button (now triggers restriction screen on mobile) */}
                    <button
                        onClick={() => handleViewModeChange('map')}
                        className={`flex flex-col items-center py-3 rounded-xl transition-all ${
                            viewMode === 'map_restricted'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <MapIcon className="w-5 h-5 mb-1" />
                        <span className="text-xs font-semibold">Map</span>
                    </button>

                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex flex-col items-center py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <Filter className="w-5 h-5 mb-1" />
                        <span className="text-xs font-semibold">Filters</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
