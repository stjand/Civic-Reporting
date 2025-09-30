// File: ReportForm.jsx
import React, { useState, useRef, useEffect } from 'react';
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
  Upload,
  MicOff,
  Pause,
  Play,
  LocateFixed
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiClient from '../config/api'; // Import the API client
import { useAuth } from '../context/AuthContext'; // Import useAuth to get user and navigation

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map Events Handler
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

// MapPicker Component - Fetches address on location select
const MapPicker = ({ initialLocation, onLocationSelect }) => {
    const mapRef = useRef(null);
    const [position, setPosition] = useState(initialLocation);
    const [loading, setLoading] = useState(false);
  
    const handleLocationSelect = async (latlng) => {
      setPosition(latlng);
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
        );
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
        if (initialLocation && mapRef.current) {
            mapRef.current.setView(initialLocation, mapRef.current.getZoom());
        }
    }, [initialLocation]);
  
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {loading && (
          <div className="absolute top-2 right-2 z-[1000] bg-white rounded-lg shadow-lg px-3 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        )}
        <MapContainer
          whenCreated={map => (mapRef.current = map)}
          center={position || [28.6139, 77.2090]} // Default to a central location if none provided
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapEvents onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
    );
};

const ModernReportForm = () => {
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  const { navigate } = useAuth(); // Use the navigate function from AuthContext

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');

  const [formData, setFormData] = useState({
    category: 'road_maintenance',
    title: '',
    description: '',
    location: null,
    photo: null,
    audioBlob: null
  });

  const [preview, setPreview] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const categories = [
    { value: 'road_maintenance', label: 'Road Maintenance', subtitle: 'Potholes, cracks, damaged pavement', icon: Construction, color: 'blue' },
    { value: 'waste_management', label: 'Waste Management', subtitle: 'Overflowing bins, illegal dumping', icon: Trash2, color: 'yellow' },
    { value: 'street_lighting', label: 'Street Lighting', subtitle: 'Broken lights, dark areas', icon: Lightbulb, color: 'blue' },
    { value: 'water_infrastructure', label: 'Water Infrastructure', subtitle: 'Leaks, pipe bursts, drainage issues', icon: Droplets, color: 'cyan' },
    { value: 'other_issues', label: 'Other Issues', subtitle: 'Public safety, vandalism, other concerns', icon: MoreHorizontal, color: 'gray' }
  ];

  const totalSteps = 4;

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const latlng = { lat: latitude, lng: longitude };
          // Manually trigger the reverse geocoding
          const mapPicker = new MapPicker({ onLocationSelect: handleLocationChange });
          mapPicker.handleLocationSelect(latlng);
          setFormData(prev => ({ ...prev, location: latlng }));
          setLoading(false);
        },
        (error) => {
          alert("Could not retrieve your location. Please enable location services.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };
  
  // This is now correctly wired to the MapPicker's onLocationSelect
  const handleLocationChange = (newLocation, address) => {
    setFormData(prev => ({ ...prev, location: newLocation }));
    setLocationAddress(address);
  };
  
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setLoading(true);
        // Assuming compressImage function is defined elsewhere or not needed
        setFormData(prev => ({ ...prev, photo: file }));
        setPreview(URL.createObjectURL(file));
        setLoading(false);
      }
    }
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
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };
  
  const clearRecording = () => {
    setAudioUrl(null);
    setFormData(prev => ({ ...prev, audioBlob: null }));
    setRecordingDuration(0);
  };

  // *** FIXED handleSubmit FUNCTION ***
  const handleSubmit = async () => {
    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    // 🟢 FIX: Renamed 'category' to 'report_type' to align with the backend database field
    submitData.append('report_type', formData.category);
    submitData.append('address', locationAddress);
    
    if (formData.location) {
      submitData.append('latitude', formData.location.lat);
      submitData.append('longitude', formData.location.lng);
    }
    
    if (formData.photo) {
      submitData.append('photo', formData.photo);
    }
    
    if (formData.audioBlob) {
      submitData.append('audio', formData.audioBlob, `audio-${Date.now()}.webm`);
    }

    try {
        // Use the apiClient to post the data
        const response = await apiClient.postFormData('/reports', submitData);
        if (response.success) {
            setReportId(response.report.id); // Assuming the backend returns the report ID
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.category !== '';
      case 2: return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 3: return formData.location !== null;
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  
  // Effect for auto-redirect after submission
  useEffect(() => {
    if (submitted) {
        const timer = setTimeout(() => {
            navigate('/citizen'); // Navigate to citizen homepage
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your report has been submitted successfully.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Report ID</p>
              <p className="text-2xl font-bold text-gray-900 break-all">{reportId}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-700">Redirecting to home page in 3 seconds...</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/citizen')}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()} // Simple reload for "Submit Another"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Submit Another
              </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Submit Report</h1>
          </div>
          <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-32">
        {/* Step 1: Category */}
        {currentStep === 1 && (
            <div className="space-y-6 bg-white rounded-3xl shadow-lg p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Category</h2>
                <p className="text-gray-500">Select the category that best describes your concern.</p>
              </div>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${formData.category === cat.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.category === cat.value ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <cat.icon className={`w-6 h-6 ${formData.category === cat.value ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{cat.label}</h4>
                        <p className="text-sm text-gray-600">{cat.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
        )}
        
        {/* Step 2: Details */}
        {currentStep === 2 && (
             <div className="space-y-6 bg-white rounded-3xl shadow-lg p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Details</h2>
                  <p className="text-gray-500">Provide more information about the issue.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Issue Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Large pothole on Main St"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Description *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows="4" placeholder="Add more details..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Photo Evidence</label>
                    {!preview ? (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 text-center">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Add a photo</p>
                        </button>
                    ) : (
                        <div className="relative">
                        <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                        <button onClick={() => { setPreview(null); setFormData(prev => ({ ...prev, photo: null })); }}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full">
                            <X className="w-4 h-4" />
                        </button>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
                 <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Voice Note</label>
                  {!audioUrl ? (
                    <div>
                      <button type="button" onClick={isRecording ? stopRecording : startRecording}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-3">
                        <Mic className="w-6 h-6 text-gray-500" />
                        <span className="font-medium">{isRecording ? `Recording... (${recordingDuration}s)` : 'Record a voice note'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-2xl">
                      <audio controls src={audioUrl} className="w-full" />
                      <button onClick={clearRecording} className="p-2 hover:bg-green-100 rounded-full">
                        <X className="w-5 h-5 text-green-700" />
                      </button>
                    </div>
                  )}
                </div>
             </div>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
            <div className="space-y-6 bg-white rounded-3xl shadow-lg p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Location</h2>
                  <p className="text-gray-500">Pinpoint the issue on the map.</p>
                </div>
                <div className="h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-gray-200">
                  <MapPicker initialLocation={formData.location} onLocationSelect={handleLocationChange}/>
                </div>
                 <button onClick={handleGetCurrentLocation} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100">
                    <LocateFixed className="w-5 h-5" /> Use My Current Location
                </button>
                {locationAddress && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                        <p className="font-bold text-green-900 text-sm mb-1">Location Selected:</p>
                        <p className="text-sm text-green-700">{locationAddress}</p>
                    </div>
                )}
            </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
             <div className="space-y-4 bg-white rounded-3xl shadow-lg p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                  <p className="text-gray-500">Please confirm all details are correct.</p>
                </div>
                <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-bold text-gray-900">{categories.find(c => c.value === formData.category)?.label}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Title</p>
                        <p className="font-bold text-gray-900">{formData.title}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{formData.description}</p>
                    </div>
                    {/* *** FIXED: Displaying location address *** */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="text-sm text-gray-700 flex items-start gap-2">
                           <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                           <span>{locationAddress || 'No address provided'}</span>
                        </p>
                    </div>
                    {preview && (
                        <div className="bg-gray-50 rounded-xl p-4">
                             <p className="text-sm text-gray-500 mb-2">Photo</p>
                             <img src={preview} alt="Report attachment" className="rounded-lg w-full max-h-48 object-cover"/>
                        </div>
                    )}
                     {audioUrl && (
                        <div className="bg-gray-50 rounded-xl p-4">
                             <p className="text-sm text-gray-500 mb-2">Voice Note</p>
                             <audio controls src={audioUrl} className="w-full" />
                        </div>
                    )}
                </div>
             </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40">
        <div className="max-w-2xl mx-auto p-4 flex gap-3">
          <button onClick={prevStep} disabled={currentStep === 1}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50">
            Back
          </button>
          <button onClick={nextStep} disabled={!isStepValid() || loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {currentStep === totalSteps ? 'Submit Report' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernReportForm;