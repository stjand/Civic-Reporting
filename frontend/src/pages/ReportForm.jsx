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
  Minimize2,
  LocateFixed // New Icon for the live location button
} from 'lucide-react'
import MapPicker from '../components/MapPicker'
import imageCompression from 'browser-image-compression'
import { submitReport } from '../services/apiServices';

// CRITICAL FIX: Custom navigation function to trigger App.jsx's router logic
const navigate = (path) => {
    if (path) {
        window.history.pushState({}, '', path)
        window.dispatchEvent(new Event('navigate'))
    }
}

const ReportForm = () => {
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
  });

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [locationAddress, setLocationAddress] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)

  const categories = [
    { value: 'pothole', label: 'Pothole/Road Damage', icon: Construction },
    { value: 'garbage', label: 'Illegal Dumping/Garbage', icon: Trash2 },
    { value: 'streetlight', label: 'Streetlight Outage', icon: Lightbulb },
    { value: 'water_leak', label: 'Water Leak/Pipe Burst', icon: Droplets },
    { value: 'other', label: 'Other Infrastructure Issue', icon: MoreHorizontal }
  ];

  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = (newLocation, address) => {
    setFormData((prev) => ({ ...prev, location: newLocation }))
    setLocationAddress(address)
  }

  // **NEW**: Function to get the user's current location
   const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true); // Indicate that we are fetching the location
      
      // Options to request the most accurate position available
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // Wait up to 10 seconds
        maximumAge: 0 // Don't use a cached location
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // The MapPicker will automatically fetch the address for these new coordinates
          handleLocationChange({ lat: latitude, lng: longitude }, "Fetching address...");
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          let alertMessage = "Could not retrieve your location. Please enable location services and try again.";
          if (error.code === error.PERMISSION_DENIED) {
            alertMessage = "Location access was denied. Please enable it in your browser settings.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alertMessage = "Location information is unavailable from your current position.";
          } else if (error.code === error.TIMEOUT) {
            alertMessage = "Request for user location timed out. Please try again.";
          }
          alert(alertMessage);
          setLoading(false);
        },
        options // Pass the high-accuracy options to the function
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Image compression error:', error)
      return file
    }
  }

  const handleFileChange = async (e) => {
    const files = e.target.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const compressedFile = await compressImage(file)
        setFormData((prev) => ({ ...prev, photo: compressedFile }))
        setPreview(URL.createObjectURL(compressedFile))
      }
    }
  }

  const startRecording = async () => { /* ... Your existing audio logic ... */ }
  const stopRecording = () => { /* ... Your existing audio logic ... */ }
  const pauseRecording = () => { /* ... Your existing audio logic ... */ }
  const resumeRecording = () => { /* ... Your existing audio logic ... */ }
  const clearRecording = () => { /* ... Your existing audio logic ... */ }
  
  const renderAudioRecorder = () => (
    <div className="border p-4 rounded-lg space-y-3 bg-gray-50">
      <label className="block text-sm font-medium text-gray-700">Voice Recording (Optional - Max 1 min)</label>
      <div className="flex items-center space-x-3">
        {!isRecording && !audioBlob && (
          <button type="button" onClick={startRecording} className="btn btn-sm btn-primary flex items-center">
            <Mic className="w-4 h-4 mr-1" /> Start Recording
          </button>
        )}
        {isRecording && !isPaused && (
          <button type="button" onClick={pauseRecording} className="btn btn-sm btn-warning flex items-center">
            <Pause className="w-4 h-4 mr-1" /> Pause
          </button>
        )}
        {isRecording && isPaused && (
          <button type="button" onClick={resumeRecording} className="btn btn-sm btn-success flex items-center">
            <Play className="w-4 h-4 mr-1" /> Resume
          </button>
        )}
        {isRecording && (
          <button type="button" onClick={stopRecording} className="btn btn-sm btn-danger flex items-center">
            <MicOff className="w-4 h-4 mr-1" /> Stop
          </button>
        )}
        {audioBlob && (
          <button type="button" onClick={clearRecording} className="btn btn-sm btn-secondary flex items-center">
            <X className="w-4 h-4 mr-1" /> Clear Recording
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {isRecording ? `Recording: ${recordingDuration}s` : audioBlob ? `Recorded: ${Math.round(recordingDuration)}s` : 'Max 60 seconds.'}
      </p>
      {audioUrl && (
        <audio controls src={audioUrl} className="w-full"></audio>
      )}
    </div>
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const form = new FormData()
    form.append('title', formData.title)
    form.append('description', formData.description)
    form.append('category', formData.category)
    form.append('address', locationAddress)

    if (formData.location) {
      form.append('latitude', formData.location.lat);
      form.append('longitude', formData.location.lng);
    }

    if (formData.photo) {
      form.append('photo', formData.photo, formData.photo.name)
    }

    if (audioBlob) {
      form.append('audio', audioBlob, `audio-${Date.now()}.webm`) 
    }

    try {
      await submitReport(form)
      setSubmitted(true)
      setTimeout(() => navigate('/my-reports'), 3000) 
    } catch (error) {
      console.error('Submission Error:', error)
      alert(`Error submitting report: ${error.error || 'Failed to submit report'}`)
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== ''
      case 2:
        return formData.location !== null
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }
  
  const nextStep = () => {
    if (isStepValid() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === totalSteps && isStepValid()) {
      handleSubmit({ preventDefault: () => {} })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="text-gray-600 mb-4">Thank you for your civic contribution. You will be redirected shortly.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center space-x-2 mb-6">
          <ArrowLeft onClick={() => navigate('/')} className="w-5 h-5 cursor-pointer text-gray-600 hover:text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Submit New Report</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            {Array.from({ length: totalSteps }, (_, index) => {
              const step = index + 1
              const isActive = currentStep === step
              const isComplete = currentStep > step
              return (
                <div key={step} className={`flex flex-col items-center flex-1 ${step < totalSteps ? 'border-r border-gray-200' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isComplete ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <p className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {step === 1 ? 'Details' : step === 2 ? 'Location' : step === 3 ? 'Media' : 'Review'}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="p-6 sm:p-8 min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" /> Report Details
                </h2>
                <p className="text-gray-600">Provide a clear title and description for the issue you are reporting.</p>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="E.g., Large pothole on Main Street near park"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe the issue in detail, including size, severity, and any hazards."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => {
                      const IconComponent = cat.icon
                      const isSelected = formData.category === cat.value
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 mb-2" />
                          <div className="font-medium text-sm">{cat.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                        <MapPin className="w-6 h-6 mr-2 text-blue-600" /> Report Location
                    </h2>
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={loading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <LocateFixed className="w-4 h-4 mr-2" />
                        {loading ? 'Getting Location...' : 'Use My Current Location'}
                    </button>
                </div>
                <p className="text-gray-600">Click on the map to place a pin, or use your current location.</p>
                
                <div className="rounded-lg overflow-hidden border border-gray-300 h-96">
                  <MapPicker 
                    initialLocation={formData.location} 
                    onLocationSelect={handleLocationChange}
                  />
                </div>
                
                {locationAddress && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <p className="font-medium text-blue-700">Identified Address:</p>
                    <p className="text-blue-600 text-sm">{locationAddress}</p>
                  </div>
                )}
                
                {!formData.location && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <p className="font-medium text-yellow-800 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" /> Please set a location on the map to continue.
                        </p>
                    </div>
                )}
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <Camera className="w-6 h-6 mr-2 text-blue-600" /> Media Attachments
                </h2>
                <p className="text-gray-600">Attach an image and an optional voice recording to support your report.</p>
                <div className="border p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional - Max 5MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-blue-700
                               hover:file:bg-blue-100"
                  />
                  {preview && (
                    <div className="mt-4 relative w-40 h-40">
                      <img src={preview} alt="Photo Preview" className="w-full h-full object-cover rounded-lg border border-gray-300" />
                      <button
                        type="button"
                        onClick={() => { setPreview(null); setFormData(prev => ({ ...prev, photo: null })); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {renderAudioRecorder()}
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-blue-600" /> Final Review
                </h2>
                <p className="text-gray-600">Please review your submission details before finalizing the report.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Report Overview</h3>
                    <p><span className="font-medium">Title:</span> {formData.title || 'N/A'}</p>
                    <p><span className="font-medium">Category:</span> {categories.find(c => c.value === formData.category)?.label || 'N/A'}</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Location</h3>
                    <p className="flex items-start"><MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                      <span className="break-words">{locationAddress || 'No Address Identified'}</span>
                    </p>
                    <p><span className="font-medium">Coordinates:</span> {formData.location ? `${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}` : 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{formData.description || 'No description provided.'}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Attachments</h3>
                    <div className="flex space-x-4">
                        {preview ? (
                            <img src={preview} alt="Photo Attachment" className="w-24 h-24 object-cover rounded-lg border border-gray-300" />
                        ) : (
                            <div className="w-24 h-24 flex items-center justify-center border rounded-lg bg-gray-100 text-gray-500">
                                No Photo
                            </div>
                        )}
                        {audioUrl ? (
                            <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                                <Mic className="w-5 h-5 text-green-700" />
                                <span className="text-sm text-green-700">Audio Recorded ({Math.round(recordingDuration)}s)</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
                                <MicOff className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-gray-500">No Audio</span>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            )}
          </div>

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
                {loading && currentStep !== 2 ? (
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

export default ReportForm;