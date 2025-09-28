import React from 'react'
import {
  Camera,
  Map,
  Zap,
  BarChart3,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  MapPin,
  ArrowRight,
  Shield,
  Users,
  Activity,
  ClipboardCheck // Added for Check Status feature
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Camera,
      title: 'Smart Reporting',
      description: 'Capture and report issues with intelligent categorization and automatic location detection'
    },
    {
      icon: Map,
      title: 'Interactive Maps',
      description: 'Real-time mapping with precise location tracking and comprehensive area coverage'
    },
    {
      icon: Zap,
      title: 'Fast Response',
      description: 'Instant notifications and real-time updates on report status and resolution progress'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights with detailed metrics and progress tracking capabilities'
    }
  ]

  const stats = [
    { number: '1,247', label: 'Reports Resolved', icon: CheckCircle },
    { number: '89%', label: 'Resolution Rate', icon: TrendingUp },
    { number: '24hrs', label: 'Avg Response Time', icon: Clock },
    { number: '4.8', label: 'User Rating', icon: Star }
  ]

  const recentReports = [
    {
      id: 'RPT-001',
      type: 'Road Maintenance',
      category: 'Infrastructure',
      location: 'MG Road Junction',
      status: 'resolved',
      time: '2 hours ago',
      priority: 'High'
    },
    {
      id: 'RPT-002',
      type: 'Waste Management',
      category: 'Sanitation',
      location: 'Brigade Road',
      status: 'progress',
      time: '4 hours ago',
      priority: 'Medium'
    },
    {
      id: 'RPT-003',
      type: 'Street Lighting',
      category: 'Utilities',
      location: 'Koramangala 5th Block',
      status: 'new',
      time: '6 hours ago',
      priority: 'Low'
    }
  ]

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new':
        return <span className="badge badge-primary">New</span>
      case 'progress':
        return <span className="badge badge-warning">In Progress</span>
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>
      default:
        return <span className="badge badge-secondary">Unknown</span>
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleNavClick = (section) => {
    switch(section) {
      case 'home':
        navigate('/')
        break
      // Redirect to user login for submitting a report
      case 'report':
        navigate('/login') // Assumes regular user login is at /login
        break
      // Redirect to admin login for the dashboard
      case 'dashboard':
        navigate('/login?admin=true') // Appends flag for admin login, as per PrivateRoute.jsx logic
        break
      // New case for checking report status
      case 'checkstatus':
        navigate('/status') // Assumes a route for report status checking
        break
      case 'about':
        // Handle navigation for the 'about' section if a route exists
        console.log('Navigating to about section')
        break
      case 'admin':
        // For 'View All Reports' button in Recent Activity
        navigate('/login?admin=true')
        break
      default:
        console.log(`Unknown navigation section: ${section}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="nav">
        <div className="container h-16 flex items-center justify-between">
          <div className="nav-brand">
            <Shield className="w-8 h-8 text-blue-600" />
            <span>CivicReport</span>
          </div>

          <div className="nav-links">
            <button
              onClick={() => handleNavClick('home')}
              className="nav-link active"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('report')}
              className="nav-link"
            >
              Submit Report
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="nav-link"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => handleNavClick('checkstatus')} // New button in nav links
              className="nav-link"
            >
              Check Status
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="nav-link"
            >
              About
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavClick('report')}
              className="btn btn-md btn-primary"
            >
              Report Issue
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container text-center max-w-4xl mx-auto">
          <h1 className="heading-xl text-gray-900 mb-6">
            Transform Your Community
            <span className="block mt-2 text-gradient">
              One Report at a Time
            </span>
          </h1>
          <p className="body-lg mb-8 max-w-3xl mx-auto">
            Join thousands of citizens making their communities better. Report issues instantly,
            track progress in real-time, and see the meaningful impact of your civic engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNavClick('report')}
              className="btn btn-lg btn-primary"
            >
              Submit Report
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleNavClick('checkstatus')} // New button in Hero section
              className="btn btn-lg btn-tertiary" // Assuming a tertiary style or use secondary
            >
              Check Report Status
              <ClipboardCheck className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="btn btn-lg btn-secondary"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-sm bg-white border-y border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="heading-md font-semibold text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="body-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-gray-900 mb-4">
              Powerful Tools for Civic Engagement
            </h2>
            <p className="body-lg max-w-2xl mx-auto">
              Our comprehensive platform provides everything you need to report, track, and resolve community issues effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="card p-6 text-center interactive">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-600 rounded-2xl">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="heading-sm text-gray-900 mb-4">{feature.title}</h3>
                  <p className="body">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="card overflow-hidden">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="heading-md text-gray-900 mb-2">Recent Activity</h2>
                  <p className="text-gray-600">Real-time updates from your community</p>
                </div>
                <button
                  onClick={() => handleNavClick('admin')} // 'admin' case redirects to admin login
                  className="btn btn-md btn-primary"
                >
                  View All Reports
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="space-y-4">
                {recentReports.map((report, index) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white rounded-lg">
                        <Activity className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{report.type}</h4>
                          <span className={`text-xs font-medium ${getPriorityColor(report.priority)}`}>
                            {report.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{report.location}</span>
                          <span>•</span>
                          <span>{report.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getStatusBadge(report.status)}
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{report.id}</div>
                        <div className="text-xs text-gray-500">{report.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="heading-lg text-gray-900 mb-6">Ready to Make a Difference?</h2>
              <p className="body-lg mb-8">
                Join our community of active citizens and help build a better tomorrow.
                Your reports create meaningful change in neighborhoods across the city.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleNavClick('report')}
                  className="btn btn-lg btn-primary"
                >
                  Submit Your First Report
                </button>
                <button
                  onClick={() => handleNavClick('checkstatus')} // New button in CTA
                  className="btn btn-lg btn-tertiary"
                >
                  Track Report Status
                </button>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="btn btn-lg btn-secondary"
                >
                  Explore Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 lg:py-12">
        <div className="container text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-semibold text-lg">CivicReport</span>
          </div>
          <p className="text-gray-400">
            Empowering communities through transparent civic engagement
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home