// File: ReportForm.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  MapPin,
  Construction,
  Trash2,
  Lightbulb,
  Droplets,
  MoreHorizontal,
  X,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Mic,
  MicOff,
  LocateFixed,
  Maximize2,
  Check,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiClient from '../config/api'; // Your real API client
import { useAuth } from '../context/AuthContext'; // Your real auth with navigate

// FIX: Removing the simulated API client and useAuth hook definitions to prevent conflicts 
// with your actual imports (assuming you have them correctly defined in your project).
// If you are ONLY running this file, uncomment the simulated sections below:
/*
const apiClient = {
  postFormData: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { 
      success: true, 
      report: { 
        report_id: 'RPT-' + Math.random().toString(36).substr(2, 9).toUpperCase() 
      } 
    };
  }
};

const useAuth = () => ({
  navigate: (path) => console.log('Navigate to:', path)
});
*/


// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map Events Handler
const MapEvents = ({ onLocationSelect, initialPosition }) => {
  const map = useMapEvents({
    click(e) {
      // Trigger selection with coordinates for reverse geocoding
      onLocationSelect(e.latlng);
    },
    locationfound(e) {
      // Trigger selection with coordinates and address (if available)
      onLocationSelect(e.latlng, e.address);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  
  useEffect(() => {
    if (initialPosition) {
      map.setView(initialPosition, 13);
    }
  }, [initialPosition, map]);

  return null;
};

// MapPicker Component
const MapPicker = ({ initialLocation, onLocationSelect, isFullscreen = false }) => {
  const mapRef = useRef(null);
  const HYDERABAD_COORD = [17.3850, 78.4867];
  const [position, setPosition] = useState(initialLocation || HYDERABAD_COORD);
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = async (latlng) => {
    setPosition(latlng);
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      if (!response.ok) throw new Error('Failed to fetch address');
      const data = await response.json();
      onLocationSelect(latlng, data.display_name || 'Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelect(latlng, 'Could not fetch address');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      if (mapRef.current) {
        mapRef.current.setView(initialLocation, mapRef.current.getZoom());
      }
    }
  }, [initialLocation]);

  return (
    <div className={`relative w-full h-full ${isFullscreen ? '' : 'rounded-xl'} overflow-hidden`}>
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Getting address...</span>
        </div>
      )}
      <MapContainer
        ref={mapRef}
        center={position || HYDERABAD_COORD} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapEvents onLocationSelect={handleLocationSelect} initialPosition={position} />
        {position && <Marker position={position} />}
        
        {/* Tap instruction overlay */}
        {!isFullscreen && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg z-[400]">
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Tap map to select location
            </p>
          </div>
        )}
      </MapContainer>
    </div>
  );
};

// Progress Stepper Component
const ProgressStepper = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full px-4 py-6 bg-white border-b">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-400'
                  }`}>
                    {step}
                  </span>
                </div>
                {stepNumber < totalSteps && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-center text-sm text-gray-500 sm:hidden">
          {steps[currentStep - 1]}
        </p>
      </div>
    </div>
  );
};

const ModernReportForm = () => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  const { navigate } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState(''); 
  const [countdown, setCountdown] = useState(3); 
  const [showMapModal, setShowMapModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: null,
    photos: [],
    audioBlob: null
  });

  const [locationAddress, setLocationAddress] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const categories = [
    { value: 'road_maintenance', label: 'Road Maintenance', subtitle: 'Potholes, cracks, damaged pavement', icon: Construction, color: 'blue' },
    { value: 'waste_management', label: 'Waste Management', subtitle: 'Overflowing bins, illegal dumping', icon: Trash2, color: 'yellow' },
    { value: 'street_lighting', label: 'Street Lighting', subtitle: 'Broken lights, dark areas', icon: Lightbulb, color: 'amber' },
    { value: 'water_infrastructure', label: 'Water Infrastructure', subtitle: 'Leaks, pipe bursts, drainage issues', icon: Droplets, color: 'cyan' },
    { value: 'other_issues', label: 'Other Issues', subtitle: 'Public safety, vandalism, other concerns', icon: MoreHorizontal, color: 'gray' }
  ];

  const stepLabels = ['Category', 'Details', 'Location', 'Review'];
  const totalSteps = 4;
  const MAX_PHOTOS = 3;

  const reverseGeocode = useCallback(async (latlng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      if (!response.ok) throw new Error('Failed to fetch address');
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return 'Could not fetch address';
    }
  }, []);
  
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const latlng = { lat: latitude, lng: longitude };
          
          const address = await reverseGeocode(latlng);
          
          handleLocationChange(latlng, address);
          setLoading(false);
        },
        (error) => {
          alert("Could not retrieve your location. Please enable location services.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  
  const handleLocationChange = (newLocation, address) => {
    setFormData(prev => ({ ...prev, location: newLocation }));
    setLocationAddress(address);
    setErrors(prev => ({ ...prev, location: '' }));
    if (showMapModal) {
      setShowMapModal(false);
    }
  };
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    let newPhotos = [...formData.photos];

    files.forEach(file => {
      if (file.type.startsWith('image/') && newPhotos.length < MAX_PHOTOS) {
        newPhotos.push({ file, preview: URL.createObjectURL(file) });
      } else if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image and was skipped.`);
      } else if (newPhotos.length >= MAX_PHOTOS) {
        alert(`You can only upload a maximum of ${MAX_PHOTOS} photos.`);
      }
    });

    setFormData(prev => ({ ...prev, photos: newPhotos }));
    e.target.value = null;
  };

  const removePhoto = (index) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, photos: newPhotos }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setFormData(prev => ({ ...prev, audioBlob }));
        stream.getTracks().forEach(track => track.stop());
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };
  
  const clearRecording = () => {
    setAudioUrl(null);
    setFormData(prev => ({ ...prev, audioBlob: null }));
    setRecordingDuration(0);
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.category) newErrors.category = 'Please select a category';
        break;
      case 2:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 3:
        if (!formData.location) newErrors.location = 'Please select a location on the map';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('report_type', formData.category);
    submitData.append('address', locationAddress);
    
    if (formData.location) {
      submitData.append('latitude', formData.location.lat);
      submitData.append('longitude', formData.location.lng);
    }
    
    formData.photos.forEach((photoObj, index) => {
        // Correctly append photos under the 'photos' field name
        submitData.append(`photos`, photoObj.file, `photo-${index}-${Date.now()}.jpg`);
    });
    
    if (formData.audioBlob) {
      submitData.append('audio', formData.audioBlob, `audio-${Date.now()}.webm`);
    }

    try {
      // 🟢 FIX: Remove leading '/api' from endpoint to prevent double prefix
      const response = await apiClient.postFormData('/reports', submitData);
      
      if (response.success && response.report) {
        setReportId(response.report.report_id || response.report.id); 
        setSubmitted(true);
      } else {
        alert(`Submission failed: ${response.error || 'Unknown server error.'}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.error || "An unexpected error occurred. Please check your connection and try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    if (submitted) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/citizen'); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, navigate]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Report Submitted!</h2>
          <p className="text-gray-600 mb-8">Your report has been successfully submitted and is being reviewed.</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 mb-6 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-2">Report ID</p>
            <p className="text-2xl font-bold text-blue-900 break-all tracking-wide">{reportId || 'N/A'}</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              🏠 Redirecting to home in <span className="font-bold text-lg">{countdown}</span> seconds...
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/citizen')}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Go Home Now
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
            >
              Submit Another
            </button>
          </div>
        </div>
        <button className="hidden" onClick={() => setCountdown(3)} /> 
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Submit Report</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Help improve your community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          steps={stepLabels}
        />

        <div className="max-w-4xl mx-auto p-4 pb-32">
          {/* Step 1: Category */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Category</h2>
                <p className="text-gray-600 mb-6">What type of issue would you like to report?</p>
                
                {errors.category && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{errors.category}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.value;
                    return (
                      <button 
                        key={cat.value} 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: cat.value }));
                          setErrors(prev => ({ ...prev, category: '' }));
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 hover:shadow-md ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <cat.icon className={`w-6 h-6 ${
                            isSelected ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1">{cat.label}</h4>
                          <p className="text-sm text-gray-600 leading-snug">{cat.subtitle}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Details</h2>
                <p className="text-gray-600 mb-6">Provide information about the issue</p>
                
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Issue Title <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                        setErrors(prev => ({ ...prev, title: '' }));
                      }}
                      placeholder="e.g., Large pothole on Main Street"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.title 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={formData.description} 
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        setErrors(prev => ({ ...prev, description: '' }));
                      }}
                      rows="4" 
                      placeholder="Describe the issue in detail..."
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
                        errors.description 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Photo Evidence ({formData.photos.length}/{MAX_PHOTOS})
                    </label>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img 
                            src={photo.preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                          />
                          <button 
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                            aria-label="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors" />
                        </div>
                      ))}
                      
                      {formData.photos.length < MAX_PHOTOS && (
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-all group"
                        >
                          <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Add Photo</span>
                        </button>
                      )}
                    </div>
                    
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <p className="mt-2 text-xs text-gray-500">Upload up to 3 photos to help document the issue</p>
                  </div>
                   
                   {/* Voice Note */}
                   <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Voice Note (Optional)
                    </label>
                    
                    {!audioUrl ? (
                      <button 
                        type="button" 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-all ${
                          isRecording 
                            ? 'border-red-500 bg-red-50 text-red-700' 
                            : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="font-medium">Recording... ({recordingDuration}s / 60s)</span>
                            <MicOff className="w-5 h-5" />
                          </>
                        ) : (
                          <>
                            <Mic className="w-6 h-6" />
                            <span className="font-medium">Tap to record voice note</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <audio controls src={audioUrl} className="flex-1" />
                        <button 
                          onClick={clearRecording} 
                          className="p-2 hover:bg-green-100 rounded-full transition-colors"
                          aria-label="Delete recording"
                        >
                          <X className="w-5 h-5 text-green-700" />
                        </button>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">Maximum recording duration: 60 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Location</h2>
                <p className="text-gray-600 mb-6">Where is the issue located?</p>
                
                {errors.location && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{errors.location}</p>
                  </div>
                )}
                
                {/* Current Location Button */}
                <button 
                  onClick={handleGetCurrentLocation} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all mb-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Getting location...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-5 h-5" />
                      <span>Use My Current Location</span>
                    </>
                  )}
                </button>
                
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or select on map</span>
                  </div>
                </div>
                
                {/* Map Container */}
                <div className="h-80 sm:h-96 rounded-xl overflow-hidden border-2 border-gray-200 relative">
                  <MapPicker 
                    initialLocation={formData.location} 
                    onLocationSelect={handleLocationChange} 
                    isFullscreen={false} 
                  />
                  
                  {/* Fullscreen Button */}
                  <button 
                    onClick={() => setShowMapModal(true)}
                    className="absolute bottom-4 right-4 p-3 bg-white text-blue-600 rounded-xl shadow-lg hover:bg-gray-50 z-[400] transition-all hover:shadow-xl border border-gray-200"
                    title="Open fullscreen map"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Selected Location Display */}
                {locationAddress && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-green-900 text-sm mb-1">Selected Location:</p>
                        <p className="text-sm text-green-700 break-words flex-1">{locationAddress}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600 mb-6">Please confirm all details before submitting</p>
                
                <div className="space-y-3">
                  {/* Category */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Category</p>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const cat = categories.find(c => c.value === formData.category);
                        return (
                          <>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <cat.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="font-bold text-gray-900">{cat?.label}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Title</p>
                    <p className="font-semibold text-gray-900">{formData.title}</p>
                  </div>
                  
                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{formData.description}</p>
                  </div>
                  
                  {/* Location */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 break-words flex-1">{locationAddress || 'No address provided'}</p>
                    </div>
                  </div>
                  
                  {/* Photos */}
                  {formData.photos.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                        Photos ({formData.photos.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative aspect-square">
                            <img 
                              src={photo.preview} 
                              alt={`Attachment ${index + 1}`} 
                              className="rounded-lg w-full h-full object-cover border-2 border-gray-200"
                            />
                            <div className="absolute top-1 right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Audio */}
                  {audioUrl && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Voice Note</p>
                      <audio controls src={audioUrl} className="w-full" />
                    </div>
                  )}
                </div>
                
                {/* Info Banner */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    ℹ️ By submitting this report, you agree that the information provided is accurate and will be reviewed by local authorities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 shadow-2xl">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex gap-3">
              <button 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {currentStep === totalSteps ? 'Submit Report' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-white z-[1000] flex flex-col">
          {/* Modal Header */}
          <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Select Location</h2>
            <button 
              onClick={() => setShowMapModal(false)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close map"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {/* Map */}
          <div className="flex-1 min-h-0">
            <MapPicker 
              initialLocation={formData.location} 
              onLocationSelect={handleLocationChange}
              isFullscreen={true} 
            />
          </div>
          
          {/* Modal Footer */}
          <div className="p-4 border-t bg-white flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center flex-shrink-0">
            {locationAddress ? (
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 break-words">{locationAddress}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Tap on the map to select a location</p>
            )}
            <button 
              onClick={() => setShowMapModal(false)} 
              disabled={!formData.location}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ModernReportForm;