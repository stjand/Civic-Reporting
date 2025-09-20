import React, { useState, useRef } from 'react'
import {
  Camera,
  MapPin,
  FileText,
  AlertCircle,
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  MoreHorizontal,
  Upload,
  X,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Shield,
  Mic,
  MicOff,
  Play,
  Pause,
  Maximize2,
  Minimize2
} from 'lucide-react'
import MapPicker from '../components/MapPicker'
import { apiClient } from '../config/api'
import { useNavigate } from 'react-router-dom'

const ReportForm = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    location: null,
    photo: null,
    audioRecording: null
  })

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [locationAddress, setLocationAddress] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)
  const [reportId, setReportId] = useState(null)
  const [redirectCountdown, setRedirectCountdown] = useState(5)

  const categories = [
    {
      value: 'pothole',
      label: 'Road Maintenance',
      description: 'Potholes, cracks, damaged pavement',
      icon: Construction,
      color: 'border-red-200 hover:border-red-300 focus-within:border-red-500'
    },
    {
      value: 'garbage',
      label: 'Waste Management',
      description: 'Overflowing bins, illegal dumping',
      icon: Trash2,
      color: 'border-yellow-200 hover:border-yellow-300 focus-within:border-yellow-500'
    },
    {
      value: 'streetlight',
      label: 'Street Lighting',
      description: 'Broken lights, dark areas',
      icon: Lightbulb,
      color: 'border-blue-200 hover:border-blue-300 focus-within:border-blue-500'
    },
    {
      value: 'water_leak',
      label: 'Water Infrastructure',
      description: 'Leaks, pipe bursts, drainage issues',
      icon: Droplets,
      color: 'border-cyan-200 hover:border-cyan-300 focus-within:border-cyan-500'
    },
    {
      value: 'other',
      label: 'Other Issues',
      description: 'Public safety, vandalism, other concerns',
      icon: MoreHorizontal,
      color: 'border-gray-200 hover:border-gray-300 focus-within:border-gray-500'
    }
  ]

  const steps = [
    { id: 1, title: 'Category', description: 'What type of issue?' },
    { id: 2, title: 'Details', description: 'Tell us more' },
    { id: 3, title: 'Location', description: 'Where is it?' },
    { id: 4, title: 'Review', description: 'Confirm & submit' }
  ]

  const getAddressFromCoordinates = async (lat, lng) => {
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    try {
      if (!API_KEY) {
        // No API key available, return coordinates as fallback
        return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      }
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`)
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address
      }
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
    } catch (error) {
      console.error('Error fetching address:', error)
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
    }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      setFormData(prev => ({ ...prev, photo: file }))
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
        setFormData(prev => ({ ...prev, audioRecording: audioBlob }))
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
    }
  }

  const deleteAudio = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setFormData(prev => ({ ...prev, audioRecording: null }))
  }

  const handleLocationSelect = async (location) => {
    setFormData(prev => ({ ...prev, location }))
    const address = await getAddressFromCoordinates(location.lat, location.lng)
    setLocationAddress(address)
  }

  // Auto-redirect countdown effect
  React.useEffect(() => {
    if (submitted && reportId) {
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            navigate('/')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [submitted, reportId, navigate])

const handleSubmit = async () => {
    if (!formData.location) {
      alert('Please select a location on the map')
      return
    }
    if (!formData.title.trim()) {
      alert('Please enter a title for your report')
      return
    }

    setLoading(true)
    
    try {
      const reportFormData = new FormData()
      reportFormData.append('title', formData.title)
      reportFormData.append('description', formData.description)
      reportFormData.append('category', formData.category)
      
      if (formData.location) {
        reportFormData.append('location', JSON.stringify(formData.location))
      }
      
      reportFormData.append('address', locationAddress)
      reportFormData.append('user_name', 'Anonymous')
      
      if (formData.photo) {
        reportFormData.append('photo', formData.photo)
      }

      if (formData.audioRecording) {
        reportFormData.append('audio', formData.audioRecording, 'recording.wav')
      }

      const response = await apiClient.post('/reports', reportFormData)
      
      // Corrected line: Access the id directly from the data object
      if (response.data && response.data.id) {
          setReportId(response.data.id);
          setSubmitted(true)
      } else {
          throw new Error('Invalid response from server. Report ID not found.')
      }
      
      // Reset form data after successful submission
      setFormData({
        title: '',
        description: '',
        category: 'pothole',
        location: null,
        photo: null,
        audioRecording: null
      })
      setPreview(null)
      setLocationAddress('')
      setAudioBlob(null)
      setAudioUrl(null)
      
    } catch (error) {
      console.error('Submit error details:', {
        message: error.message,
        stack: error.stack
      })
      
      // More specific error message
      if (error.message.includes('Failed to fetch')) {
        alert('Cannot connect to server. Please check if the backend is running on port 3001.')
      } else if (error.message.includes('API Error: 404')) {
        alert('API endpoint not found. Please check your backend routes.')
      } else {
        alert(`Failed to submit report: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }


  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.category
      case 2: return formData.title.trim()
      case 3: return formData.location
      case 4: return true
      default: return false
    }
  }

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === formData.category)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your report has been submitted successfully. We'll review it and provide updates on the progress.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Report ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900">RPT-{reportId}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 font-medium">
                Redirecting to home page in {redirectCountdown} seconds...
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                Go Home Now
              </button>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setCurrentStep(1)
                  setReportId(null)
                  setRedirectCountdown(5)
                  setFormData({
                    title: '',
                    description: '',
                    category: 'pothole',
                    location: null,
                    photo: null,
                    audioRecording: null
                  })
                  setPreview(null)
                  setLocationAddress('')
                  setAudioBlob(null)
                  setAudioUrl(null)
                }}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-lg text-gray-900">Submit Report</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of 4
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 transition-colors duration-200 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-semibold text-gray-900">{steps[currentStep - 1]?.title}</h3>
              <p className="text-sm text-gray-600">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">

            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What type of issue are you reporting?</h2>
                  <p className="text-gray-600">Select the category that best describes your concern</p>
                </div>

                <div className="space-y-3">
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <label
                        key={category.value}
                        className={`flex items-start p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                          formData.category === category.value
                            ? 'border-blue-500 bg-blue-50'
                            : category.color
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={formData.category === category.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-4 w-full">
                          <div className={`p-3 rounded-lg transition-colors duration-200 ${
                            formData.category === category.value ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`w-6 h-6 transition-colors duration-200 ${
                              formData.category === category.value ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{category.label}</h3>
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about the issue</h2>
                  <p className="text-gray-600">Provide details to help us understand and address the problem</p>
                </div>

                <div className="space-y-6">
                  {/* Selected Category Display */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      {React.createElement(getSelectedCategory()?.icon, { className: "w-5 h-5 text-blue-600" })}
                      <span className="font-medium text-gray-900">{getSelectedCategory()?.label}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Issue Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief, clear description of the issue"
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-200 rounded-md"
                      required
                    />
                    <p className="text-xs text-gray-500">Be specific and concise (e.g., "Large pothole on Main St near traffic light")</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Details
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Any additional information that would help address this issue..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors duration-200 rounded-md resize-none"
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Photo Evidence
                    </label>

                    {preview ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreview(null)
                              setFormData(prev => ({ ...prev, photo: null })) // Changed to photo
                              if (fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          capture="environment"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200 text-center flex items-center justify-center space-x-2"
                        >
                          <Camera className="w-6 h-6 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Capture a photo</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200 text-center flex items-center justify-center space-x-2"
                        >
                          <Upload className="w-6 h-6 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Upload from gallery</p>
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>

                  {/* Audio Recording */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Voice Note (Optional)
                    </label>
                    
                    {audioUrl ? (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-full">
                                <Mic className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-800">Voice note recorded</p>
                                <p className="text-xs text-green-600">Click play to review</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={playAudio}
                                disabled={isPlaying}
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200 disabled:opacity-50"
                              >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={deleteAudio}
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`w-full p-4 border-2 border-dashed rounded-lg transition-all duration-200 text-center flex items-center justify-center space-x-2 ${
                            isRecording 
                              ? 'border-red-300 bg-red-50 hover:border-red-400' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="w-6 h-6 text-red-600 animate-pulse" />
                              <p className="text-sm font-medium text-red-600">Stop Recording</p>
                            </>
                          ) : (
                            <>
                              <Mic className="w-6 h-6 text-gray-400" />
                              <p className="text-sm font-medium text-gray-600">Record voice note</p>
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 text-center">Optional: Add a voice description of the issue</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Where is this issue located?</h2>
                  <p className="text-gray-600">Click on the map to pinpoint the exact location</p>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Select Location</h3>
                    <button
                      type="button"
                      onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      {isMapFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className={`transition-all duration-300 ${
                    isMapFullscreen 
                      ? 'fixed inset-0 z-50 bg-white p-4' 
                      : 'relative'
                  }`}>
                    {isMapFullscreen && (
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Select Report Location</h3>
                        <button
                          onClick={() => setIsMapFullscreen(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                    <MapPicker 
                      onLocationSelect={handleLocationSelect} 
                      initialLocation={formData.location}
                      isFullscreen={isMapFullscreen}
                    />
                  </div>
                </div>

                {formData.location && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Location Selected</p>
                        <p className="text-xs text-green-600">{locationAddress}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Report</h2>
                  <p className="text-gray-600">Please confirm all details are correct before submitting</p>
                </div>

                <div className="space-y-4">
                  {/* Category */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Issue Type</h3>
                    <div className="flex items-center space-x-3">
                      {React.createElement(getSelectedCategory()?.icon, { className: "w-5 h-5 text-blue-600" })}
                      <span className="font-medium text-gray-900">{getSelectedCategory()?.label}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                    <h4 className="font-medium text-gray-900 mb-1">{formData.title}</h4>
                    {formData.description && (
                      <p className="text-sm text-gray-600">{formData.description}</p>
                    )}
                  </div>

                  {/* Photo */}
                  {preview && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Photo</h3>
                      <img src={preview} alt="Report" className="w-24 h-24 object-cover rounded-lg" />
                    </div>
                  )}

                  {/* Audio */}
                  {audioUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Voice Note</h3>
                      <div className="flex items-center space-x-2">
                        <Mic className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-900">Voice recording attached</span>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-900">{locationAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Navigation Footer */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <button
                onClick={nextStep}
                disabled={!isStepValid() || loading}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : currentStep === 4 ? (
                  'Submit Report'
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportForm