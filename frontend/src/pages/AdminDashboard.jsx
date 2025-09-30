import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    MapPin, Search, Bell, User, X, Mail, Clock, CheckCircle, AlertTriangle,
    Construction, Droplets, Zap, Trash2, Building2, Shield, Eye, Flag, RefreshCw,
    LogOut, Loader2, Activity, FileText, Camera, Calendar, Download, Filter,
    BarChart3, Layers, ZoomIn, ZoomOut,
    Home, Settings, ChevronRight, CheckSquare, Square,
    Archive, Send, MessageSquare, Image, ExternalLink, MapIcon, List,
    Plus, Minus, RotateCcw, BookOpen, Menu
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Real imports from apiServices.js
import { getAdminDashboard, updateReportStatus, getOfficialsList } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
// NOTE: VITE_API_URL is available via import.meta.env, no direct import needed.

// --- CONFIGURATION CONSTANTS & LEAFLET FIX ---

const DEFAULT_MAP_CENTER = [17.3850, 78.4867]; // Hyderabad, India as a default
const DEFAULT_MAP_ZOOM = 12;

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEPARTMENTS = [
    { id: 'all', name: 'All Reports', icon: Shield, color: 'bg-slate-600', gradient: 'from-slate-500 to-slate-700', lightBg: 'bg-slate-50', textColor: 'text-slate-700', shadowClass: 'shadow-slate-600/30' },
    { id: 'road_maintenance', name: 'Roads & Infrastructure', icon: Construction, color: 'bg-orange-600', gradient: 'from-orange-500 to-orange-700', lightBg: 'bg-orange-50', textColor: 'text-orange-700', shadowClass: 'shadow-orange-600/30' },
    { id: 'waste_management', name: 'Sanitation & Waste', icon: Trash2, color: 'bg-emerald-600', gradient: 'from-emerald-500 to-emerald-700', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', shadowClass: 'shadow-emerald-600/30' },
    { id: 'street_lighting', name: 'Street Lighting', icon: Zap, color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600', lightBg: 'bg-amber-50', textColor: 'text-amber-700', shadowClass: 'shadow-amber-500/30' },
    { id: 'water_infrastructure', name: 'Water Supply', icon: Droplets, color: 'bg-cyan-600', gradient: 'from-cyan-500 to-cyan-700', lightBg: 'bg-cyan-50', textColor: 'text-cyan-700', shadowClass: 'shadow-cyan-600/30' },
    { id: 'other_issues', name: 'Other Issues', icon: Building2, color: 'bg-violet-600', gradient: 'from-violet-500 to-violet-700', lightBg: 'bg-violet-50', textColor: 'text-violet-700', shadowClass: 'shadow-violet-600/30' },
];

const STATUS_CONFIG = {
    resolved: { color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300', icon: CheckCircle, label: 'Resolved', gradient: 'from-emerald-500 to-emerald-700', markerColor: '#10b981' },
    in_progress: { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300', icon: Clock, label: 'In Progress', gradient: 'from-blue-500 to-blue-700', markerColor: '#3b82f6' },
    acknowledged: { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', icon: Eye, label: 'Acknowledged', gradient: 'from-amber-400 to-amber-600', markerColor: '#f59e0b' },
    new: { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-300', icon: AlertTriangle, label: 'New', gradient: 'from-rose-500 to-rose-700', markerColor: '#f43f5e' },
};

const PRIORITY_CONFIG = {
    high: { color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-300', label: 'High Priority', icon: Flag, badge: 'bg-rose-100 text-rose-700 border-rose-300' },
    medium: { color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', label: 'Medium Priority', icon: Flag, badge: 'bg-amber-100 text-amber-700 border-amber-300' },
    low: { color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-300', label: 'Low Priority', icon: Flag, badge: 'bg-slate-100 text-slate-700 border-slate-300' },
};

const STATUS_FILTERS = [
    { id: 'all', name: 'All Status', icon: Layers },
    { id: 'new', name: 'New', icon: AlertTriangle },
    { id: 'acknowledged', name: 'Acknowledged', icon: Eye },
    { id: 'in_progress', name: 'In Progress', icon: Clock },
    { id: 'resolved', name: 'Resolved', icon: CheckCircle },
];

const getStatusConfig = (status) => STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.new;
const getPriorityConfig = (priority) => PRIORITY_CONFIG[priority?.toLowerCase()] || PRIORITY_CONFIG.low;

const getLogIconAndColor = (log) => {
    let Icon = BookOpen; let iconColor = 'text-blue-600';
    if (log.type === 'status' && log.action.includes('resolved')) { Icon = CheckCircle; iconColor = 'text-emerald-600'; }
    else if (log.type === 'status' && log.action.includes('in_progress')) { Icon = Clock; iconColor = 'text-amber-600'; }
    else if (log.type === 'assign') { Icon = ListChecks; iconColor = 'text-violet-600'; }
    else if (log.type === 'priority') { Icon = Flag; iconColor = 'text-rose-600'; }
    else if (log.type === 'submit') { Icon = Send; iconColor = 'text-blue-600'; }
    return { Icon, iconColor };
};

// --- UTILITY COMPONENTS ---

const MapFlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position && position[0] && position[1]) {
            map.flyTo(position, 16, { duration: 1.2, easeLinearity: 0.25 });
        }
    }, [position, map]);
    return null;
};

const MapControls = ({ onZoomIn, onZoomOut, onReset }) => (
    <div className="absolute bottom-8 right-4 z-[400] flex flex-col gap-2 lg:block hidden">
        <button onClick={onZoomIn} className="bg-white hover:bg-slate-50 p-2.5 rounded-xl shadow-lg border border-slate-200 transition-all hover:shadow-xl" title="Zoom In"><ZoomIn className="w-5 h-5 text-slate-700" /></button>
        <button onClick={onZoomOut} className="bg-white hover:bg-slate-50 p-2.5 rounded-xl shadow-lg border border-slate-200 transition-all hover:shadow-xl" title="Zoom Out"><ZoomOut className="w-5 h-5 text-slate-700" /></button>
        <button onClick={onReset} className="bg-white hover:bg-slate-50 p-2.5 rounded-xl shadow-lg border border-slate-200 transition-all hover:shadow-xl" title="Reset View"><Home className="w-5 h-5 text-slate-700" /></button>
    </div>
);

// --- CORE COMPONENTS ---

const ReportDetailsPanel = ({ report, onClose, onStatusUpdate, officials, departments, fetchData }) => {
    const [status, setStatus] = useState(report.status);
    const [priority, setPriority] = useState(report.priority);
    const [assignedOfficialId, setAssignedOfficialId] = useState(report.assigned_to_user_id || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const statusConfig = getStatusConfig(status);
    const priorityConfig = getPriorityConfig(priority);
    const dept = departments.find(d => d.id === report.report_type);
    const departmentOfficials = officials.filter(o => o.department === report.report_type);

    const hasChanges = status !== report.status || priority !== report.priority || assignedOfficialId !== (report.assigned_to_user_id || '');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const ASSET_BASE_URL = API_BASE_URL.replace('/api', '');

    const auditLogs = useMemo(() => {
        // Mocking logic from original code, now using helper
        const baseLog = [{ id: 1, action: 'Report Submitted', user: report.user_name || 'Citizen', type: 'submit', timestamp: new Date(report.created_at) }];
        if (report.status !== 'new' && report.updated_at !== report.created_at) {
            baseLog.push({ id: 2, action: `Status changed to ${report.status}`, user: 'System/Admin', type: 'status', timestamp: new Date(report.updated_at) });
        }
        return baseLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [report.report_id, report.created_at, report.updated_at, report.user_name]);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await onStatusUpdate(report.report_id, { status, priority, assigned_to_user_id: assignedOfficialId || null });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={`fixed inset-y-0 right-0 z-[600] lg:relative lg:w-[420px] lg:translate-x-0 ${report ? 'w-full translate-x-0' : 'w-0 translate-x-full'} bg-white border-l border-slate-200 flex flex-col flex-shrink-0 shadow-2xl transition-all duration-300 ease-in-out rounded-l-2xl lg:rounded-none`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dept?.color || 'bg-slate-600'} shadow-lg`}>
                        {dept && <dept.icon className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Report Details</h2>
                        <p className="text-xs text-slate-500 font-mono">{report.report_id}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
                >
                    <X className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-slate-50">
                <button onClick={() => setActiveTab('details')} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Details</button>
                <button onClick={() => setActiveTab('actions')} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'actions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Actions</button>
                <button onClick={() => setActiveTab('audit')} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Audit Log</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {activeTab === 'details' && (
                    <div className="p-5 space-y-5">
                        {/* Status & Priority Badges */}
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${statusConfig.bgColor} ${statusConfig.color} border-2 ${statusConfig.borderColor}`}><statusConfig.icon className="w-3.5 h-3.5 mr-1.5" />{statusConfig.label}</span>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${priorityConfig.badge} border-2`}><priorityConfig.icon className="w-3.5 h-3.5 mr-1.5" />{priorityConfig.label}</span>
                        </div>

                        {/* Title & Description */}
                        <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{report.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{report.description}</p>
                        </div>

                        {/* Evidence (Correct Asset URL) */}
                        {(report.photo_url || report.audio_url) && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center"><Camera className="w-3.5 h-3.5 mr-1.5" />Evidence</p>
                                {report.photo_url && (
                                    <img src={`${ASSET_BASE_URL}${report.photo_url}`} alt="Evidence" className="w-full h-32 object-cover rounded-xl" onError={(e) => e.target.style.display = 'none'} />
                                )}
                                {report.audio_url && (
                                    <audio controls src={`${ASSET_BASE_URL}${report.audio_url}`} className="w-full rounded-lg" />
                                )}
                            </div>
                        )}

                        {/* Location & Reporter Info */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5" />Location & Details</p>
                            <p className="text-sm text-slate-700 leading-relaxed font-semibold">{report.address}</p>
                            <p className="text-xs text-slate-500 mt-2">
                                Reported by: <span className='font-medium'>{report.user_name || 'Anonymous'}</span> on {new Date(report.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="p-5 space-y-5">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                            <div className="flex items-center space-x-2 mb-3"><Activity className="w-4 h-4 text-amber-700" /><p className="text-sm font-bold text-amber-900">Quick Actions</p></div>
                            <p className="text-xs text-amber-800 leading-relaxed">Update the report status, priority, and assign officials to handle this issue.</p>
                        </div>

                        {/* Assign Official */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center"><User className="w-3.5 h-3.5 mr-1.5" />Assign Official</label>
                            <select value={assignedOfficialId} onChange={e => setAssignedOfficialId(e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition-all hover:border-slate-400">
                                <option value="">-- Unassigned --</option>
                                {departmentOfficials.map(official => (<option key={official.id} value={official.id}>{official.name} - {official.designation}</option>))}
                            </select>
                        </div>

                        {/* Update Status */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center"><Activity className="w-3.5 h-3.5 mr-1.5" />Update Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition-all hover:border-slate-400">
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
                            </select>
                        </div>

                        {/* Update Priority */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center"><Flag className="w-3.5 h-3.5 mr-1.5" />Update Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium transition-all hover:border-slate-400">
                                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (<option key={key} value={key}>{config.label}</option>))}
                            </select>
                        </div>

                        {/* Changes Summary */}
                        {hasChanges && (
                            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                                <p className="text-xs font-bold text-blue-900 mb-2 flex items-center"><AlertTriangle className="w-3.5 h-3.5 mr-1.5" />Pending Changes</p>
                                <ul className="space-y-1 text-xs text-blue-800">
                                    {status !== report.status && (<li>• Status: {report.status} → {status}</li>)}
                                    {priority !== report.priority && (<li>• Priority: {report.priority} → {priority}</li>)}
                                    {assignedOfficialId !== (report.assigned_to_user_id || '') && (<li>• Official assignment updated</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Audit Log Tab Content */}
                {activeTab === 'audit' && (
                    <div className="p-5">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2"><BookOpen className="w-4 h-4 text-blue-600" />Report Audit Trail</h3>
                        <div className="space-y-4">
                            {auditLogs
                                .map((log, index) => {
                                    const isLast = index === auditLogs.length - 1;
                                    const { Icon, iconColor } = getLogIconAndColor(log);

                                    return (
                                        <div key={log.id} className="flex">
                                            <div className="flex flex-col items-center mr-4">
                                                <div className={`w-3 h-3 ${iconColor.replace('text-', 'bg-')} rounded-full shadow-md`}></div>
                                                {!isLast && <div className="w-0.5 h-full bg-slate-200"></div>}
                                            </div>
                                            <div className={`pb-6 ${isLast ? '' : 'flex-1'}`}>
                                                <p className="text-sm font-semibold text-slate-900 capitalize leading-snug flex items-center"><Icon className={`w-3.5 h-3.5 mr-1.5 ${iconColor}`} />{log.action}</p>
                                                <p className="text-xs text-slate-700 mt-1">By <span className="font-medium">{log.user}</span></p>
                                                <p className="text-xs text-slate-500 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer (Save Button) */}
            <div className="p-5 border-t border-slate-200 flex-shrink-0 bg-slate-50">
                <button onClick={handleUpdate} disabled={!hasChanges || isUpdating} className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-lg ${hasChanges && !isUpdating ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-[1.01]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    {isUpdating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Updating Report...</>) : (<><CheckCircle className="w-5 h-5 mr-2" />{hasChanges ? 'Save Changes & Notify' : 'No Changes to Save'}</>)}
                </button>
            </div>
        </div>
    );
};


const ReportImagePlaceholder = ({ report, isSelected, onSelect }) => {
    const ASSET_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

    const ImageOrPlaceholder = useMemo(() => {
        if (report.photo_url) {
            return (
                <img
                    src={`${ASSET_BASE_URL}${report.photo_url}`}
                    alt="Report Evidence"
                    className="w-8 h-8 object-cover rounded-lg border border-slate-200"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Image className="w-4 h-4 text-slate-400"/></div>'; }}
                />
            );
        }
        const DeptIcon = DEPARTMENTS.find(d => d.id === report.report_type)?.icon || FileText;
        const deptColor = DEPARTMENTS.find(d => d.id === report.report_type)?.color || 'bg-slate-400';

        return (
            <div className={`w-8 h-8 rounded-lg ${deptColor} flex items-center justify-center text-white/90`}>
                <DeptIcon className="w-4 h-4" />
            </div>
        );
    }, [report.photo_url, report.report_type, ASSET_BASE_URL]);

    return (
        <button
            onClick={onSelect}
            className={`flex items-center justify-center relative transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
            title={isSelected ? 'Deselect Report' : 'Select Report'}
        >
            {ImageOrPlaceholder}
            {isSelected && (
                <CheckSquare className="w-4 h-4 text-white bg-blue-600 rounded-md absolute -top-1 -right-1 z-10 shadow-lg border-2 border-white" />
            )}
        </button>
    );
};


const ListView = ({ reports, selectedReports, onReportSelect, onReportsSelect, onViewModeChange, isMobile }) => {
    const handleSelectAll = () => onReportsSelect(selectedReports.length === reports.length ? [] : reports.map(r => r.report_id));
    const handleSelectReport = (reportId) => onReportsSelect(selectedReports.includes(reportId) ? selectedReports.filter(id => id !== reportId) : [...selectedReports, reportId]);

    return (
        <div className="h-full flex flex-col bg-white rounded-t-2xl lg:rounded-none">
            {/* List Header (Desktop Only) */}
            {!isMobile && (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-3"><h2 className="text-lg font-bold text-slate-900">Reports List</h2><span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span></div>
                    <button onClick={onViewModeChange} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors"><MapIcon className="w-4 h-4" /><span>Map View</span></button>
                </div>
            )}

            {/* Table Container */}
            <div className="flex-1 overflow-auto pt-4 lg:pt-0 pb-20 lg:pb-0">
                {reports.length === 0 ? (
                    <div className="h-full flex items-center justify-center"><div className="text-center"><FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" /><p className="text-slate-600 font-medium">No reports found</p><p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p></div></div>
                ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectedReports.length === reports.length && reports.length > 0} onChange={handleSelectAll} className="rounded border-slate-300 w-4 h-4 text-blue-600 focus:ring-blue-500" /></th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Report</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Dept</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {reports.map(report => {
                                const statusConfig = getStatusConfig(report.status);
                                const priorityConfig = getPriorityConfig(report.priority);
                                const isSelected = selectedReports.includes(report.report_id);

                                return (
                                    <tr key={report.report_id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <ReportImagePlaceholder
                                                report={report}
                                                isSelected={isSelected}
                                                onSelect={() => handleSelectReport(report.report_id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div><p className="text-sm font-semibold text-slate-900">{report.title}</p><p className="text-xs text-slate-500 mt-0.5 font-mono">{report.report_id}</p></div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 capitalize hidden sm:table-cell">
                                            {report.report_type?.replace('_', ' ').split(' ')[0]}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}><statusConfig.icon className="w-3 h-3 mr-1" />{statusConfig.label}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold ${priorityConfig.badge} border`}><priorityConfig.icon className="w-3 h-3 mr-1" />{priorityConfig.label.split(' ')[0]}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">{new Date(report.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => onReportSelect(report)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center ml-auto"><Eye className="w-4 h-4 mr-1" />View</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// Analytics Overlay Component (Desktop Only)
const AnalyticsOverlay = ({ analytics, onClose, departments }) => {
    return (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[500] flex items-center justify-center p-6 lg:block hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
                        <div><h2 className="text-xl font-bold text-slate-900">Analytics Dashboard</h2><p className="text-sm text-slate-500">Comprehensive report insights</p></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200"><FileText className="w-8 h-8 text-blue-600 mb-3" /><p className="text-3xl font-bold text-blue-900">{analytics.total}</p><p className="text-sm text-blue-700 font-medium mt-1">Total Reports</p></div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200"><CheckCircle className="w-8 h-8 text-emerald-600 mb-3" /><p className="text-3xl font-bold text-emerald-900">{analytics.resolved}</p><p className="text-sm text-emerald-700 font-medium mt-1">Resolved</p></div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200"><Clock className="w-8 h-8 text-amber-600 mb-3" /><p className="text-3xl font-bold text-amber-900">{analytics.avgResponseTime || 'N/A'}</p><p className="text-sm text-amber-700 font-medium mt-1">Avg Response Time</p></div>
                        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-5 border border-violet-200"><Activity className="w-8 h-8 text-violet-600 mb-3" /><p className="text-3xl font-bold text-violet-900">{analytics.resolutionRate}%</p><p className="text-sm text-violet-700 font-medium mt-1">Resolution Rate</p></div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Department Distribution */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Reports by Department</h3>
                            <div className="space-y-3">
                                {Object.entries(analytics.byDepartment).map(([key, value]) => {
                                    const dept = departments.find(d => d.id === key);
                                    const percentage = analytics.total > 0 ? ((value / analytics.total) * 100).toFixed(1) : 0;
                                    return (<div key={key}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-700">{dept?.name}</span><span className="text-sm font-bold text-slate-900">{value}</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className={`h-2 rounded-full ${dept?.color}`} style={{ width: `${percentage}%` }}></div></div></div>);
                                })}
                            </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Reports by Priority</h3>
                            <div className="space-y-4">
                                {Object.entries(analytics.byPriority || {}).map(([key, value]) => {
                                    const config = getPriorityConfig(key);
                                    const percentage = analytics.total > 0 ? ((value / analytics.total) * 100).toFixed(1) : 0;
                                    return (<div key={key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"><div className="flex items-center space-x-3"><div className={`p-2.5 rounded-xl ${config.bgColor}`}><config.icon className={`w-5 h-5 ${config.color}`} /></div><div><p className="font-semibold text-slate-900">{config.label}</p><p className="text-xs text-slate-500">{percentage}% of total</p></div></div><span className="text-2xl font-bold text-slate-900">{value}</span></div>);
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 7-Day Trend */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">7-Day Report Trend</h3>
                        <div className="flex items-end justify-between h-40 gap-2">
                            {analytics.last7Days?.map((day, index) => {
                                const maxCount = Math.max(...(analytics.last7Days || []).map(d => d.count)) || 1;
                                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full relative group">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
                                                style={{ height: `${height}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                                            />
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {day.count} reports
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 mt-2 font-medium">{day.date}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT (Dynamic Data & Responsive) ---

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const mapRef = useRef();

    // State Management
    const [data, setData] = useState({ reports: [], stats: {} });
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [activeDepartment, setActiveDepartment] = useState('all');
    const [activeStatus, setActiveStatus] = useState('all');
    const [activePriority, setActivePriority] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [viewMode, setViewMode] = useState('map');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedReports, setSelectedReports] = useState([]);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
    const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);

    // Helper Function
    function calculateAvgResponseTime(reports) {
        const resolvedReports = reports.filter(r => r.status === 'resolved' && r.updated_at);
        if (resolvedReports.length === 0) return null;
        const totalHours = resolvedReports.reduce((sum, r) => {
            const created = new Date(r.created_at);
            const resolved = new Date(r.updated_at);
            return sum + (resolved - created) / (1000 * 60 * 60);
        }, 0);
        const avgHours = totalHours / resolvedReports.length;
        return avgHours < 24 ? `${avgHours.toFixed(1)}h` : `${(avgHours / 24).toFixed(1)}d`;
    }

    // Filtered and Sorted Reports (useMemo)
    const filteredReports = useMemo(() => {
        let reports = (data.reports || []);
        const term = globalSearchTerm.toLowerCase();

        reports = reports.filter(report => {
            const matchesSearch = report.title?.toLowerCase().includes(term) || report.report_id?.toLowerCase().includes(term) || report.description?.toLowerCase().includes(term) || report.address?.toLowerCase().includes(term);
            const matchesDept = activeDepartment === 'all' || report.report_type === activeDepartment;
            const matchesStatus = activeStatus === 'all' || report.status === activeStatus;
            const matchesPriority = activePriority === 'all' || report.priority === activePriority;
            let matchesDate = true;
            if (dateRange !== 'all') {
                const reportDate = new Date(report.created_at);
                const now = new Date();
                const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
                switch (dateRange) { case 'today': matchesDate = daysDiff === 0; break; case 'week': matchesDate = daysDiff <= 7; break; case 'month': matchesDate = daysDiff <= 30; break; case '3months': matchesDate = daysDiff <= 90; break; default: matchesDate = true; }
            }
            return matchesSearch && matchesDept && matchesStatus && matchesPriority && matchesDate;
        });

        reports.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'created_at') comparison = new Date(b.created_at) - new Date(a.created_at);
            else if (sortBy === 'priority') { const priorityOrder = { high: 3, medium: 2, low: 1 }; comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0); }
            else if (sortBy === 'status') { const statusOrder = { new: 4, acknowledged: 3, in_progress: 2, resolved: 1 }; comparison = (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0); }
            return sortOrder === 'asc' ? -comparison : comparison;
        });
        return reports;
    }, [data.reports, globalSearchTerm, activeDepartment, activeStatus, activePriority, dateRange, sortBy, sortOrder]);


    // Analytics Calculations (useMemo)
    const analytics = useMemo(() => {
        const reports = filteredReports;
        const total = reports.length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const inProgress = reports.filter(r => r.status === 'in_progress').length;
        const newReports = reports.filter(r => r.status === 'new').length;
        const acknowledged = reports.filter(r => r.status === 'acknowledged').length;
        const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
        const avgResponseTime = calculateAvgResponseTime(reports);
        const byDepartment = {};
        DEPARTMENTS.forEach(dept => { if (dept.id !== 'all') { byDepartment[dept.id] = reports.filter(r => r.report_type === dept.id).length; } });
        const byPriority = { high: reports.filter(r => r.priority === 'high').length, medium: reports.filter(r => r.priority === 'medium').length, low: reports.filter(r => r.priority === 'low').length, };
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today); date.setDate(date.getDate() - i);
            return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: reports.filter(r => { const rDate = new Date(r.created_at); return rDate.toDateString() === date.toDateString(); }).length };
        }).reverse();
        return { total, resolved, inProgress, newReports, acknowledged, resolutionRate, avgResponseTime, byDepartment, byPriority, last7Days };
    }, [filteredReports]);

    // Handlers and Effects

    const resetFilters = useCallback(() => { setGlobalSearchTerm(''); setActiveDepartment('all'); setActiveStatus('all'); setActivePriority('all'); setDateRange('all'); setSortBy('created_at'); setSortOrder('desc'); setShowAdvancedFilters(false); }, []);

    // Set default view for desktop/mobile
    useEffect(() => {
        const isDesktop = window.innerWidth >= 1024;
        if (isDesktop) { setViewMode('map'); setSidebarCollapsed(false); }
        else { setViewMode('list'); setSidebarCollapsed(true); }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashboardData, officialsData] = await Promise.all([
                getAdminDashboard(),
                getOfficialsList()
            ]);

            setData(dashboardData.data || dashboardData);
            setOfficials(officialsData.officials || []);
            setError(null);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.error || 'Failed to fetch dashboard data. Check API services.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);


    // Status Update Handler
    const handleStatusUpdate = useCallback(async (reportId, updateData) => {
        try {
            await updateReportStatus(reportId, updateData);
            await fetchData();
            setSelectedReport(null);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert(`Error updating report: ${error.error || 'Please try again.'}`);
        }
    }, [fetchData]);

    const handleBulkStatusUpdate = async (newStatus) => {
        try {
            await Promise.all(
                selectedReports.map(id => updateReportStatus(id, { status: newStatus }))
            );
            await fetchData();
            setSelectedReports([]);
        } catch (error) {
            console.error("Bulk update failed:", error);
            alert("Failed to update reports");
        }
    };
    const handleExportData = () => { /* ... implementation ... */ };
    const handleMapZoomIn = () => { if (mapRef.current) mapRef.current.setView(mapRef.current.getCenter(), mapRef.current.getZoom() + 1); };
    const handleMapZoomOut = () => { if (mapRef.current) mapRef.current.setView(mapRef.current.getCenter(), mapRef.current.getZoom() - 1); };
    const handleMapReset = () => { setMapCenter(DEFAULT_MAP_CENTER); setMapZoom(DEFAULT_MAP_ZOOM); };


    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                        <div className="absolute inset-0 blur-xl opacity-50"><Loader2 className="w-16 h-16 animate-spin text-blue-400" /></div>
                    </div>
                    <p className="text-slate-700 font-semibold text-lg">Loading Dashboard</p>
                    <p className="text-slate-500 text-sm mt-1">Fetching latest reports...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border border-rose-200">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-rose-600" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Connection Failed</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button onClick={fetchData} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center mx-auto">
                        <RefreshCw className="w-5 h-5 mr-2" />Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    // --- FINAL MAIN RENDER ---
    return (
        <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">

            {/* 1. Left Sidebar (Desktop) / Off-Canvas Menu (Mobile) */}
            <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 ${sidebarCollapsed ? 'w-0 lg:w-24 -translate-x-full' : 'w-72 lg:w-80 translate-x-0'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 shadow-xl lg:shadow-none`}>

                {/* Mobile Overlay */}
                {!sidebarCollapsed && window.innerWidth < 1024 && (<div className="absolute inset-0 bg-black/50 z-[-1]" onClick={() => setSidebarCollapsed(true)}></div>)}

                {/* Sidebar Header (Logo/User/Collapse) */}
                <div className="p-4 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        {!(sidebarCollapsed && window.innerWidth >= 1024) ? (
                            <div className="flex items-center space-x-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"><Shield className="w-5 h-5 text-white" /></div>
                                <div className="lg:block"><h1 className="text-sm font-bold text-slate-900">CivicReport</h1><p className="text-xs text-slate-500">Admin Panel</p></div>
                            </div>
                        ) : (<div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg mx-auto"><Shield className="w-5 h-5 text-white" /></div>)}

                        <div className="flex items-center space-x-1.5">
                            {!(sidebarCollapsed && window.innerWidth >= 1024) && (
                                <button onClick={logout} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors group" title="Sign Out"><LogOut className="w-4 h-4 text-slate-600 group-hover:text-rose-600" /></button>
                            )}
                            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                {window.innerWidth < 1024 && !sidebarCollapsed ? (<X className="w-4 h-4 text-slate-600" />) : (<ChevronRight className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />)}
                            </button>
                        </div>
                    </div>

                    {/* Quick Analytics Tabs in Sidebar Header */}
                    {!(sidebarCollapsed && window.innerWidth >= 1024) && (
                        <div className="p-0 border-t border-b border-slate-200 py-3 mb-1">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200 text-center"><p className="text-xs text-blue-700 font-medium mb-0.5">Total Reports</p><p className="text-xl font-bold text-blue-900">{analytics.total}</p></div>
                                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-3 border border-rose-200 text-center"><p className="text-xs text-rose-700 font-medium mb-0.5">New Issues</p><p className="text-xl font-bold text-rose-900">{analytics.newReports}</p></div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Sidebar Content (Filters) */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {!(sidebarCollapsed && window.innerWidth >= 1024) ? (
                        <>
                            {/* Departments */}
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-2 px-2"><h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments</h3><span className="text-xs text-slate-400">{DEPARTMENTS.length - 1}</span></div>
                                <div className="space-y-1">
                                    {DEPARTMENTS.map(dept => {
                                        const count = dept.id === 'all' ? filteredReports.length : filteredReports.filter(r => r.report_type === dept.id).length;
                                        const isActive = activeDepartment === dept.id;
                                        return (<button key={dept.id} onClick={() => setActiveDepartment(dept.id)} className={`w-full px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition-all duration-200 group ${isActive ? `bg-gradient-to-r ${dept.gradient} text-white shadow-lg ${dept.shadowClass} font-semibold` : `text-slate-700 hover:bg-slate-100 ${dept.lightBg}/50 hover:${dept.lightBg}`}`}><div className="flex items-center space-x-2.5"><dept.icon className={`w-4 h-4 ${isActive ? 'drop-shadow-sm' : ''}`} /><span className="truncate">{dept.name}</span></div><span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>{count}</span></button>);
                                    })}
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="p-3 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-2 px-2"><h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</h3><button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{showAdvancedFilters ? 'Less' : 'More'}</button></div>
                                <div className="space-y-1">
                                    {STATUS_FILTERS.map(status => {
                                        const count = status.id === 'all' ? filteredReports.length : filteredReports.filter(r => r.status === status.id).length;
                                        const isActive = activeStatus === status.id;
                                        return (<button key={status.id} onClick={() => setActiveStatus(status.id)} className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-all duration-200 ${isActive ? 'bg-slate-900 text-white shadow-md font-medium' : 'text-slate-600 hover:bg-slate-100'}`}><div className="flex items-center space-x-2"><status.icon className="w-3.5 h-3.5" /><span>{status.name}</span></div><span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>{count}</span></button>);
                                    })}
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 animate-in slide-in-from-top">
                                        <div><label className="text-xs font-semibold text-slate-600 mb-1.5 block">Priority</label><select value={activePriority} onChange={(e) => setActivePriority(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="all">All Priorities</option><option value="high">High Priority</option><option value="medium">Medium Priority</option><option value="low">Low Priority</option></select></div>
                                        <div><label className="text-xs font-semibold text-slate-600 mb-1.5 block">Date Range</label><select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="all">All Time</option><option value="today">Today</option><option value="week">Last 7 Days</option><option value="month">Last 30 Days</option><option value="3months">Last 3 Months</option></select></div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sort By</label>
                                            <div className="flex gap-2">
                                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="created_at">Date</option><option value="priority">Priority</option><option value="status">Status</option></select>
                                                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors" title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}>{sortOrder === 'asc' ? '↑' : '↓'}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="p-3 space-y-2 border-t border-slate-200">
                                <button onClick={resetFilters} className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all flex items-center justify-center space-x-2 border border-rose-200" title="Clear all filters and search terms"><RotateCcw className="w-4 h-4" /><span>Reset Filters</span></button>
                                <button onClick={() => setShowAnalytics(!showAnalytics)} className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-2 ${showAnalytics ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} lg:block hidden`}> <BarChart3 className="w-4 h-4" /><span>Analytics</span></button>
                                <button onClick={handleExportData} className="w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"><Download className="w-4 h-4" /><span>Export CSV</span></button>

                                {/* Bulk Actions */}
                                {selectedReports.length > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                                        <p className="text-xs font-semibold text-blue-900 mb-2">{selectedReports.length} Selected</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleBulkStatusUpdate('acknowledged')} className="flex-1 px-2 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700">Acknowledge</button>
                                            <button onClick={() => handleBulkStatusUpdate('resolved')} className="flex-1 px-2 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">Resolve</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Collapsed Sidebar Icons (Desktop Only)
                        <div className="p-2 space-y-2">
                            {DEPARTMENTS.slice(0, 6).map(dept => (<button key={dept.id} onClick={() => setActiveDepartment(dept.id)} className={`w-full p-3 rounded-xl transition-all ${activeDepartment === dept.id ? `bg-gradient-to-r ${dept.gradient} text-white shadow-lg` : 'text-slate-600 hover:bg-slate-100'}`} title={dept.name}><dept.icon className="w-5 h-5 mx-auto" /></button>))}
                            <button onClick={logout} className="w-full p-3 hover:bg-slate-100 rounded-xl transition-colors group" title="Sign Out"><LogOut className="w-5 h-5 text-slate-600 group-hover:text-rose-600 mx-auto" /></button>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-slate-200 flex-shrink-0">
                    {!(sidebarCollapsed && window.innerWidth >= 1024) ? (
                        <div className="flex items-center space-x-2.5 px-2 py-2.5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"><User className="w-5 h-5 text-white" /></div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Admin'}</p><p className="text-xs text-slate-500">Administrator</p></div><Settings className="w-4 h-4 text-slate-400" />
                        </div>
                    ) : (<div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md mx-auto"><User className="w-5 h-5 text-white" /></div>)}
                </div>
            </div>

            {/* 2. Center Map/List Area */}
            <div className={`flex-1 relative ${selectedReport ? 'w-0 lg:w-auto' : 'w-full'} overflow-hidden`}>

                {/* Mobile Header Bar - Fix 1 of Mobile responsiveness */}
                <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex justify-start items-center sticky top-0 z-40">
                    <button onClick={() => setSidebarCollapsed(false)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors mr-3"><Menu className="w-5 h-5 text-slate-600" /></button>
                    <h2 className="text-lg font-bold text-slate-900 capitalize">{viewMode} View</h2>
                    <button onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')} className="ml-auto p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><MapIcon className="w-5 h-5 text-slate-600" /></button>
                </div>

                {/* FLOATING SEARCH BAR - Fix 2 of Mobile responsiveness (higher Z-index) */}
                <div className="absolute top-4 w-11/12 lg:w-1/2 left-1/2 -translate-x-1/2 z-[501] pointer-events-none">
                    <div className="relative pointer-events-auto">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input type="text" placeholder="Search reports by title, ID, description, or address..." value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-base shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:shadow-2xl" />
                    </div>
                </div>

                {/* View Content (Map / List) - Fix 3 of Mobile responsiveness (Top padding) */}
                <div className='h-full pt-20 lg:pt-[100px] pb-16 lg:pb-0'>
                    {viewMode === 'map' ? (
                        <>
                            <MapContainer ref={mapRef} center={mapCenter} zoom={mapZoom} className="h-full w-full rounded-2xl lg:rounded-none" style={{ background: '#f1f5f9' }} zoomControl={false}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

                                {selectedReport?.latitude && selectedReport?.longitude && (<MapFlyTo position={[selectedReport.latitude, selectedReport.longitude]} />)}

                                {/* Markers Layer (Using actual data) */}
                                {filteredReports.map(report => {
                                    if (!report.latitude || !report.longitude) return null;
                                    const statusConfig = getStatusConfig(report.status);
                                    const isSelected = selectedReport?.report_id === report.report_id;
                                    const markerIcon = L.divIcon({
                                        html: `<div class="relative ${isSelected ? 'animate-bounce' : ''}"><svg viewBox="0 0 24 24" width="${isSelected ? '40' : '32'}" height="${isSelected ? '40' : '32'}" fill="${statusConfig.markerColor}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
                                        className: '', iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32], iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
                                    });

                                    return (
                                        <Marker key={report.report_id} position={[report.latitude, report.longitude]} icon={markerIcon} eventHandlers={{ click: () => setSelectedReport(report), mouseover: (e) => { e.target.openPopup(); } }}>
                                            <Popup className="custom-popup">
                                                <div className="p-2 min-w-[200px]"><div className="flex items-start justify-between mb-2"><p className="font-semibold text-sm pr-2">{report.title}</p><span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} flex-shrink-0`}>{statusConfig.label}</span></div><button onClick={() => setSelectedReport(report)} className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors">View Details →</button></div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>

                            {/* Map Controls (Desktop/Bottom Right) */}
                            <MapControls onZoomIn={handleMapZoomIn} onZoomOut={handleMapZoomOut} onReset={handleMapReset} />

                            {/* Map Legend (Desktop/Bottom Left) */}
                            <div className="absolute bottom-8 left-6 z-[400] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-slate-200/50 lg:block hidden">
                                <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center"><Layers className="w-3.5 h-3.5 mr-1.5" />Status Legend</h4>
                                <div className="space-y-2">
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (<div key={key} className="flex items-center gap-2.5 text-xs"><div className="w-4 h-4 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: config.markerColor }}></div><span className="font-medium text-slate-700">{config.label}</span></div>))}
                                </div>
                            </div>

                            {/* Desktop Floating Action Buttons */}
                            <div className="absolute top-24 left-6 right-6 z-[400] pointer-events-none lg:block hidden">
                                <div className="flex gap-3 flex-wrap justify-end">
                                    <button onClick={fetchData} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl px-3 py-3 hover:bg-slate-50 pointer-events-auto transition-all border border-slate-200/50 group" title="Refresh Data"><RefreshCw className="w-5 h-5 text-slate-600 group-hover:rotate-180 transition-transform duration-500" /></button>
                                    <button onClick={() => setViewMode('list')} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl px-3 py-3 hover:bg-slate-50 pointer-events-auto transition-all border border-slate-200/50" title="Switch to List View"><List className="w-5 h-5 text-slate-600" /></button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <ListView
                            reports={filteredReports}
                            selectedReports={selectedReports}
                            onReportSelect={setSelectedReport}
                            onReportsSelect={setSelectedReports}
                            onViewModeChange={() => setViewMode('map')}
                            isMobile={window.innerWidth < 1024}
                        />
                    )}
                </div>

                {/* Analytics Overlay (Desktop Only) */}
                {showAnalytics && window.innerWidth >= 1024 && (
                    <AnalyticsOverlay analytics={analytics} onClose={() => setShowAnalytics(false)} departments={DEPARTMENTS.filter(d => d.id !== 'all')} />
                )}
            </div>

            {/* 3. Right Panel - Report Details */}
            {selectedReport && (
                <ReportDetailsPanel
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                    onStatusUpdate={handleStatusUpdate}
                    officials={officials}
                    departments={DEPARTMENTS}
                    fetchData={fetchData}
                />
            )}

            {/* 4. Mobile Bottom Navigation (Fixed and High Z-index) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-[450]">
                <div className="grid grid-cols-4 gap-1 p-2">
                    <button onClick={() => setViewMode('list')} className={`flex flex-col items-center py-2 px-1 rounded-lg ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}><List className="w-5 h-5" /><span className="text-xs mt-1">List</span></button>
                    <button onClick={() => setViewMode('map')} className={`flex flex-col items-center py-2 px-1 rounded-lg ${viewMode === 'map' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}><MapPin className="w-5 h-5" /><span className="text-xs mt-1">Map</span></button>
                    <button onClick={() => setShowAnalytics(true)} className={`flex flex-col items-center py-2 px-1 rounded-lg ${showAnalytics ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}><BarChart3 className="w-5 h-5" /><span className="text-xs mt-1">Analytics</span></button>
                    <button onClick={() => setShowMobileFilters(true)} className={`flex flex-col items-center py-2 px-1 rounded-lg ${showMobileFilters ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-50'}`}><Filter className="w-5 h-5" /><span className="text-xs mt-1">Filter</span></button>
                </div>
            </div>

            {/* 5. Mobile Filters Sheet (Modal) */}
            {showMobileFilters && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-[700]" onClick={() => setShowMobileFilters(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold text-slate-900">Filters</h2><button onClick={() => setShowMobileFilters(false)}><X className="w-6 h-6 text-slate-600" /></button></div>
                        <div className="mb-4"><label className="text-sm font-semibold text-slate-700 mb-2 block">Search</label><div className="relative"><Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Search reports..." value={globalSearchTerm} onChange={(e) => setGlobalSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div>
                        <div className="mb-4"><label className="text-sm font-semibold text-slate-700 mb-2 block">Department</label><select value={activeDepartment} onChange={(e) => setActiveDepartment(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">{DEPARTMENTS.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}</select></div>
                        <div className="mb-4"><label className="text-sm font-semibold text-slate-700 mb-2 block">Status</label><select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="all">All Status</option><option value="new">New</option><option value="acknowledged">Acknowledged</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option></select></div>
                        <div className="mb-4"><label className="text-sm font-semibold text-slate-700 mb-2 block">Priority</label><select value={activePriority} onChange={(e) => setActivePriority(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="all">All Priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                        <div className="mb-6"><label className="text-sm font-semibold text-slate-700 mb-2 block">Sort By</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="created_at">Date</option><option value="priority">Priority</option><option value="status">Status</option></select></div>
                        <div className="flex gap-3">
                            <button onClick={() => { resetFilters(); setShowMobileFilters(false); }} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium">Reset & Close</button>
                            <button onClick={() => setShowMobileFilters(false)} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium">Apply & Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Mobile View/Overlay (Modalized) */}
            {showAnalytics && window.innerWidth < 1024 && (
                <div className="fixed inset-0 bg-black/50 z-[650]" onClick={() => setShowAnalytics(false)}>
                    <div className="absolute inset-0 bg-white overflow-y-auto pb-20" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
                            <button onClick={() => setShowAnalytics(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
                        </div>
                        <div className="p-4 space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"><FileText className="w-6 h-6 text-blue-600 mb-2" /><p className="text-2xl font-bold text-blue-900">{analytics.total}</p><p className="text-xs text-blue-700 font-medium mt-1">Total Reports</p></div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200"><CheckCircle className="w-6 h-6 text-emerald-600 mb-2" /><p className="text-2xl font-bold text-emerald-900">{analytics.resolved}</p><p className="text-xs text-emerald-700 font-medium mt-1">Resolved</p></div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200"><Clock className="w-6 h-6 text-amber-600 mb-2" /><p className="text-2xl font-bold text-amber-900">{analytics.avgResponseTime || 'N/A'}</p><p className="text-xs text-amber-700 font-medium mt-1">Avg Time</p></div>
                                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4 border border-violet-200"><Activity className="w-6 h-6 text-violet-600 mb-2" /><p className="text-2xl font-bold text-violet-900">{analytics.resolutionRate}%</p><p className="text-xs text-violet-700 font-medium mt-1">Resolution Rate</p></div>
                            </div>

                            {/* Department Distribution (Mobile Optimized) */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h3 className="text-base font-bold text-slate-900 mb-3">Reports by Department</h3>
                                <div className="space-y-3">{Object.entries(analytics.byDepartment).map(([key, value]) => { const dept = DEPARTMENTS.find(d => d.id === key); const percentage = analytics.total > 0 ? ((value / analytics.total) * 100).toFixed(0) : 0; return (<div key={key}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-slate-700">{dept?.name}</span><span className="text-sm font-bold text-slate-900">{value}</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className={`h-2 rounded-full ${dept?.color}`} style={{ width: `${percentage}%` }}></div></div></div>); })}</div>
                            </div>

                            {/* Status Breakdown (Mobile Optimized) */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h3 className="text-base font-bold text-slate-900 mb-3">Status Breakdown</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-rose-50 rounded-lg p-3 border border-rose-200"><p className="text-xl font-bold text-slate-900">{analytics.newReports}</p><p className="text-xs text-slate-600 mt-0.5 flex items-center"><AlertTriangle className='w-3 h-3 mr-1' /> New</p></div>
                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200"><p className="text-xl font-bold text-slate-900">{analytics.acknowledged}</p><p className="text-xs text-slate-600 mt-0.5 flex items-center"><Eye className='w-3 h-3 mr-1' /> Ack</p></div>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200"><p className="text-xl font-bold text-slate-900">{analytics.inProgress}</p><p className="text-xs text-slate-600 mt-0.5 flex items-center"><Clock className='w-3 h-3 mr-1' /> In Progress</p></div>
                                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200"><p className="text-xl font-bold text-slate-900">{analytics.resolved}</p><p className="text-xs text-slate-600 mt-0.5 flex items-center"><CheckCircle className='w-3 h-3 mr-1' /> Resolved</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;