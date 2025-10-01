import React, { useState, useEffect, useCallback } from 'react';
import { 
	FileText, 
	Eye, 
	CheckSquare, 
	User, 
	PlusCircle,
	MapPin,
	Clock,
	TrendingUp,
	Shield,
	ArrowRight,
	Activity,
	Loader2,
	CheckCircle,
	Bell,
	X,
	Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

import { // Import API Service functions
	getMyStats, 
	getMyReports, 
	getMyNotifications, 
	markNotificationAsRead,
} from '../services/apiServices'; 

// Fixed Notification Bell Component - Now accepts 'navigate' and uses 'onMarkAsRead'
// ✅ FIX 1: Set a default value of [] for the notifications prop in the component signature
const NotificationBell = ({ notifications = [], onMarkAsRead, navigate }) => {
	const unreadCount = notifications.filter(n => !n.is_read).length;
	const [isOpen, setIsOpen] = useState(false);

	const handleBellClick = () => {
			setIsOpen(!isOpen);
	};
	
	const handleNotificationClick = (notification) => {
			setIsOpen(false);
			// Call the external handler which uses the API
			if (!notification.is_read) {
					onMarkAsRead(notification.id);
			}
			// Use the injected navigate function for routing
			if(notification.report_id) {
					// Use navigate to go to the report status page
					navigate(`/status/${notification.report_id}`);
			}
	};

	return (
			<div className="relative">
					<button
							onClick={handleBellClick}
							className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors relative"
							aria-label="Notifications"
					>
							<Bell className="w-5 h-5"/>
							{unreadCount > 0 && (
									<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
											{unreadCount > 9 ? '9+' : unreadCount}
									</span>
							)}
					</button>
					
					{/* Notification Dropdown Panel - FIXED POSITIONING */}
					{isOpen && (
							<>
									{/* Backdrop to close on click outside */}
									<div 
											className="fixed inset-0 z-40" 
											onClick={() => setIsOpen(false)}
									/>
									
									{/* Dropdown Panel */}
									<div className="fixed sm:absolute right-2 sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50">
											<div className="p-3 sm:p-4 border-b flex items-center justify-between">
													<h3 className="text-base sm:text-lg font-bold text-gray-900">
															Notifications {unreadCount > 0 && `(${unreadCount} new)`}
													</h3>
													<button 
															onClick={() => setIsOpen(false)} 
															className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
															aria-label="Close"
													>
															<X className="w-5 h-5" />
													</button>
											</div>
											<div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
													{notifications.length === 0 ? (
															<p className="p-4 text-sm text-gray-500 text-center">No recent updates.</p>
													) : (
															notifications.map(n => (
																	<div 
																			key={n.id} 
																			className={`p-3 border-b last:border-b-0 transition-colors cursor-pointer ${
																					n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
																			}`}
																			onClick={() => handleNotificationClick(n)}
																	>
																			<h4 className={`text-sm font-semibold mb-1 ${
																					n.is_read ? 'text-gray-700' : 'text-blue-700'
																			}`}>
																					{n.title}
																			</h4>
																			<p className="text-xs text-gray-600 mb-1 line-clamp-2">{n.message}</p>
																			<p className="text-xs text-gray-400">
																					{new Date(n.created_at).toLocaleDateString()}
																			</p>
																	</div>
															))
													)}
											</div>
									</div>
							</>
					)}
			</div>
	);
};

const CitizenHomepage = () => {
	// Use AuthContext for user state and navigation functions
	const { navigate, logout, user } = useAuth();

	// Replace mock data with state initialized to empty/null
	const [stats, setStats] = useState(null);
	const [recentReports, setRecentReports] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Function to fetch all necessary data on component load
	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			
			// Fetch data in parallel
			const [statsResponse, reportsResponse, notificationsResponse] = await Promise.all([
				getMyStats(),
				getMyReports(),
				getMyNotifications(),
			]);

			// Check for 'success' property, as API responses are structured as { success: true, data: ... }
			// The getMyStats service returns the data directly.
			setStats(statsResponse.stats || null); 
			
			// FIX: Ensure reports data is handled correctly (the getMyReports service returns { reports: [...] })
			setRecentReports(Array.isArray(reportsResponse.reports) ? reportsResponse.reports.slice(0, 3) : []);
			
			// ✅ FIX 2: Ensure notifications data is handled correctly (the getMyNotifications service returns { notifications: [...] })
			setNotifications(Array.isArray(notificationsResponse.notifications) ? notificationsResponse.notifications : []);

		} catch (err) {
			console.error("Error fetching homepage data:", err);
			// Check if it's a known error structure or just use a generic message
			// API service throws error.response?.data, which contains { error: "..." }
			setError(err.error || err.message || "Failed to load dashboard data. Please try again.");
			// If all fetches failed, clear state to trigger error UI
			setStats(null);
			setRecentReports([]);
			setNotifications([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Handler to mark a notification as read and update the state
	const handleMarkAsRead = useCallback(async (notificationId) => {
		try {
				await markNotificationAsRead(notificationId); // Real API call
				// Optimistically update the local state after successful API call
				setNotifications(prev => prev.map(n => 
					n.id === notificationId ? { ...n, is_read: true } : n
				));
		} catch (error) {
				console.error("Failed to mark notification as read:", error);
				// Optionally refetch data on failure, or just log the error
		}
	}, []);

	// Handler for all navigation buttons
	const handleNavigate = (path) => () => {
		// Close mobile menu on navigate
		setMobileMenuOpen(false);
		navigate(path);
	};

	const getStatusColor = (status) => {
		switch(status?.toLowerCase()) {
			case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
			case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'acknowledged': return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'new': return 'bg-gray-100 text-gray-800 border-gray-200';
			default: return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	// ------------------------- RENDER LOGIC -------------------------

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (error && !stats && recentReports.length === 0) {
		return (
				<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
						<div className="text-center p-8 bg-white rounded-xl shadow-lg">
								<p className="text-red-500 font-semibold mb-4">Error</p>
								<p className="text-gray-700">{error}</p>
								<button 
										onClick={fetchData} 
										className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
										Retry Load
								</button>
						</div>
				</div>
		);
	}

	const resolutionRate = stats && stats.reportsSubmitted > 0 
		? Math.round((stats.reportsResolved / stats.reportsSubmitted) * 100) 
		: 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
			{/* Header */}
			<header className="bg-white shadow-sm sticky top-0 z-30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-14 sm:h-16">
						{/* Logo - Made clickable to homepage */}
						<button onClick={handleNavigate('/citizen')} className="flex items-center space-x-2">
							<Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
							<span className="text-lg sm:text-xl font-semibold text-gray-900">CivicReport</span>
						</button>
						
						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-3">
							<NotificationBell 
								notifications={notifications} 
								onMarkAsRead={handleMarkAsRead}
								navigate={navigate} // Pass the real navigate function
							/>
							<button 
								onClick={handleNavigate('/profile')} // Link to profile
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
							>
								Profile
							</button>
							<button 
								onClick={logout} // Call logout from useAuth
								className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
							>
								Sign Out
							</button>
						</div>

						{/* Mobile Menu Button */}
						<div className="flex md:hidden items-center space-x-2">
							<NotificationBell 
								notifications={notifications} 
								onMarkAsRead={handleMarkAsRead}
								navigate={navigate} // Pass the real navigate function
							/>
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="p-2 text-gray-600 hover:text-gray-900"
								aria-label="Menu"
							>
								<Menu className="w-6 h-6" />
							</button>
						</div>
					</div>

					{/* Mobile Menu */}
					{mobileMenuOpen && (
						<div className="md:hidden py-3 border-t border-gray-200">
							<div className="flex flex-col space-y-2">
								{/* Direct links to main pages on mobile */}
								<button 
									onClick={handleNavigate('/report')}
									className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-center"
								>
									Submit Report
								</button>
								<button 
									onClick={handleNavigate('/my-reports')}
									className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-center"
								>
									My Reports
								</button>
								<button 
									onClick={handleNavigate('/validate-reports')}
									className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-center"
								>
									Validate Reports
								</button>
								{(user?.role === 'admin' || user?.role === 'official') && (
									<button 
										onClick={handleNavigate('/admin')} 
										className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-center"
									>
										Admin Dashboard
									</button>
								)}
								<div className="pt-2 border-t border-gray-100">
									<button 
										onClick={handleNavigate('/profile')} // Link to profile
										className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm text-center"
									>
										Profile
									</button>
								</div>
								<button 
									onClick={logout} // Call logout from useAuth
									className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-center"
								>
									Sign Out
								</button>
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
				{/* Hero Section */}
				<div className="text-center mb-8 sm:mb-12">
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
						Transform Your Community
					</h1>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4">
						<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
							One Report at a Time
						</span>
					</h2>
					<p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
						Join thousands of citizens making their communities better. Report issues instantly,
						track progress in real-time, and see the meaningful impact of your civic engagement.
					</p>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-16 px-4">
						<button 
							onClick={handleNavigate('/report')} // Link to Report Form
							className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg flex items-center justify-center shadow-lg shadow-blue-500/30"
						>
							Submit Report
							<ArrowRight className="w-5 h-5 ml-2" />
						</button>
						<button 
							onClick={handleNavigate('/my-reports')} // Link to My Reports
							className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium text-base sm:text-lg border-2 border-gray-200 shadow-sm"
						>
							My Reports
						</button>
						{/* Conditional button for Validation/Admin page - Citizen can validate, Admin/Official go to their main dashboard */}
						{user?.role === 'citizen' && (
							<button 
								onClick={handleNavigate('/validate-reports')} // Link to Validate Reports
								className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium text-base sm:text-lg border-2 border-gray-200 shadow-sm"
							>
								Validate Reports
							</button>
						)}
						{(user?.role === 'admin' || user?.role === 'official') && (
							<button 
								onClick={handleNavigate('/admin')} // Link to Admin Dashboard
								className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-colors font-medium text-base sm:text-lg border-2 border-gray-200 shadow-sm"
							>
								Admin Dashboard
							</button>
						)}
					</div>
				</div>

				{/* Stats Cards - Only render if stats data is available */}
				{stats && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 lg:mb-16">
						<div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center">
							<div className="flex justify-center mb-3 sm:mb-4">
								<div className="p-2 sm:p-3 lg:p-4 bg-blue-100 rounded-xl sm:rounded-2xl">
									<CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
								</div>
							</div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
								{stats.reportsResolved || 0}
							</div>
							<div className="text-xs sm:text-sm text-gray-600">Reports Resolved</div>
						</div>

						<div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center">
							<div className="flex justify-center mb-3 sm:mb-4">
								<div className="p-2 sm:p-3 lg:p-4 bg-blue-100 rounded-xl sm:rounded-2xl">
									<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
								</div>
							</div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
								{resolutionRate}%
							</div>
							<div className="text-xs sm:text-sm text-gray-600">Resolution Rate</div>
						</div>

						<div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center">
							<div className="flex justify-center mb-3 sm:mb-4">
								<div className="p-2 sm:p-3 lg:p-4 bg-blue-100 rounded-xl sm:rounded-2xl">
									<Clock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
								</div>
							</div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
								{stats.reportsInProgress || 0}
							</div>
							<div className="text-xs sm:text-sm text-gray-600">In Progress</div>
						</div>

						<div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center">
							<div className="flex justify-center mb-3 sm:mb-4">
								<div className="p-2 sm:p-3 lg:p-4 bg-blue-100 rounded-xl sm:rounded-2xl">
									<Activity className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
								</div>
							</div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
								{stats.reportsSubmitted || 0}
							</div>
							<div className="text-xs sm:text-sm text-gray-600">Total Submitted</div>
						</div>
					</div>
				)}

				{/* Features Section - Buttons are now functional */}
				<div className="mb-8 sm:mb-12 lg:mb-16">
					<div className="text-center mb-8 sm:mb-12 px-4">
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
							Powerful Tools for Civic Engagement
						</h2>
						<p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
							Our comprehensive platform provides everything you need to report, track, and resolve community issues effectively.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
						<button 
							onClick={handleNavigate('/report')} // Link to Report Form
							className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-md transition-all group"
						>
							<div className="flex justify-center mb-4 sm:mb-6">
								<div className="p-3 sm:p-4 bg-blue-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
									<PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
								</div>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Smart Reporting</h3>
							<p className="text-sm sm:text-base text-gray-600">Capture and report issues with intelligent categorization</p>
						</button>

						<button 
							onClick={handleNavigate('/my-reports')} // Link to My Reports
							className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-md transition-all group"
						>
							<div className="flex justify-center mb-4 sm:mb-6">
								<div className="p-3 sm:p-4 bg-blue-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
									<FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
								</div>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Track Reports</h3>
							<p className="text-sm sm:text-base text-gray-600">Real-time updates on your submitted reports</p>
						</button>

						<button 
							onClick={handleNavigate('/validate-reports')} // Link to Validate Reports
							className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-md transition-all group"
						>
							<div className="flex justify-center mb-4 sm:mb-6">
								<div className="p-3 sm:p-4 bg-blue-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
									<CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
								</div>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Validate Reports</h3>
							<p className="text-sm sm:text-base text-gray-600">Help verify community reports for accuracy</p>
						</button>

						<button 
							onClick={handleNavigate('/profile')} // Link to My Profile
							className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center hover:shadow-md transition-all group"
						>
							<div className="flex justify-center mb-4 sm:mb-6">
								<div className="p-3 sm:p-4 bg-blue-600 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform">
									<User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
								</div>
							</div>
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">My Profile</h3>
							<p className="text-sm sm:text-base text-gray-600">Manage your account and preferences</p>
						</button>
					</div>
				</div>

				{/* Recent Reports */}
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
					<div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Recent Activity</h2>
								<p className="text-sm sm:text-base text-gray-600">Your recent reports and progress updates</p>
							</div>
							<button 
								onClick={handleNavigate('/my-reports')} // Link to My Reports
								className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
							>
								View All Reports
							</button>
						</div>
					</div>
					
					<div className="p-4 sm:p-6 lg:p-8">
						<div className="space-y-3 sm:space-y-4">
							{recentReports.length === 0 ? (
								<div className="text-center py-8 sm:py-12">
									<FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
									<p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6">No reports yet</p>
									<button 
										onClick={handleNavigate('/report')} // Link to Report Form
										className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
									>
										Submit Your First Report
									</button>
								</div>
							) : (
								recentReports.map((report) => (
									<div 
										key={report.report_id} 
										className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
										onClick={handleNavigate(`/status/${report.report_id}`)} // Make the whole row clickable
									>
										<div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
											<div className="flex-shrink-0 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
												<Activity className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2 truncate">
													{report.report_type}
												</h4>
												<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
													<span className="flex items-center">
														<MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
														<span className="truncate">{report.report_id}</span>
													</span>
													<span className="hidden sm:inline">•</span>
													<span className="flex items-center">
														<Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
														{new Date(report.created_at).toLocaleDateString()}
													</span>
												</div>
											</div>
										</div>
										
										<div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
											<span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(report.status)}`}>
												{report.status.replace('_', ' ')}
											</span>
											{/* View button is now redundant since the whole row is clickable, but keep it for visual consistency and navigation target */}
											<button 
												onClick={(e) => { e.stopPropagation(); handleNavigate(`/status/${report.report_id}`)(); }} // Stop propagation to prevent double click
												className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
											>
												<Eye className="w-4 h-4 sm:w-5 sm:h-5" />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default CitizenHomepage;