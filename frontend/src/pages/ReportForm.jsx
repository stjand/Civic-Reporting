// Exact path of file: frontend/src/pages/ReportForm.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  FileText, 
  Camera, 
  Send, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// Assuming MapPicker component exists in './components/MapPicker'
// import MapPicker from '../components/MapPicker'; 

/**
 * List of issue categories
 */
const CATEGORIES = [
  'Road Maintenance',
  'Sanitation & Waste',
  'Street Lighting',
  'Public Safety',
  'Water & Utilities',
  'Parks & Green Spaces',
  'Traffic & Signals',
  'Other Infrastructure',
];

/**
 * Report Submission Form Component
 * Allows authenticated citizens to submit a new report.
 */
const ReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null); // { lat: number, lng: number }
  const [urgency, setUrgency] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);


  const handleImageChange = (e) => {
    // In a real app, you would handle file size/compression here
    setImageFile(e.target.files[0]);
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!location) {
        setSubmitError("Please select the issue location on the map.");
        return;
    }
    
    setIsSubmitting(true);

    // --- Prepare form data for API ---
    const formData = {
        userId: user.id,
        title,
        category,
        description,
        location: location,
        urgency,
        // imageFile: imageFile // In a real app, this would be appended to FormData
    };
    
    console.log("Submitting report:", formData);

    try {
      // --- Simulate API Report Submission ---
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear form and show success
      setTitle('');
      setDescription('');
      setLocation(null);
      setImageFile(null);
      setSubmitSuccess("Report submitted successfully! Tracking ID: RPT-011");

      // Optional: Redirect after a delay
      setTimeout(() => navigate('/my-reports'), 3000);

    } catch (error) {
      setSubmitError(error.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-start space-x-4 mb-8">
            <button
                onClick={() => navigate('/citizen-dashboard')}
                className="p-3 text-gray-600 hover:text-gray-900 rounded-full bg-white shadow-md hover:bg-gray-100 transition"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className='flex-1'>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Send className="w-7 h-7 mr-3 text-blue-600" />
                    Submit a New Civic Report
                </h1>
                <p className="text-gray-600 mt-1">
                    Please provide detailed information to help us resolve the issue quickly.
                </p>
            </div>
        </div>

        {/* Status Messages */}
        {submitError && (
            <div className="p-3 mb-4 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg" role="alert">
                {submitError}
            </div>
        )}
        {submitSuccess && (
            <div className="p-3 mb-4 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-lg" role="alert">
                {submitSuccess}
            </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          
          {/* Section 1: Issue Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">1. Issue Details</h2>
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="input-label">Issue Title <span className="text-red-500">*</span></label>
                    <div className="input-group">
                        <FileText className="input-icon" />
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field"
                            placeholder="e.g., Large Pothole on Main Street"
                            required
                        />
                    </div>
                </div>

                {/* Category & Urgency */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="input-label">Category <span className="text-red-500">*</span></label>
                        <div className="input-group">
                            <Tag className="input-icon" />
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field appearance-none"
                                required
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="urgency" className="input-label">Urgency Level <span className="text-red-500">*</span></label>
                        <div className="input-group">
                            <Send className="input-icon" />
                            <select
                                id="urgency"
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="input-field appearance-none"
                                required
                            >
                                <option value="High">High (Immediate Danger)</option>
                                <option value="Medium">Medium (Significant Problem)</option>
                                <option value="Low">Low (General Maintenance)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="input-label">Detailed Description</label>
                    <textarea
                        id="description"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Describe the issue, its size, and any immediate impact."
                        required
                    />
                </div>
            </div>
          </div>
          
          {/* Section 2: Location & Media */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">2. Location & Evidence</h2>
            <div className="space-y-4">
                
                {/* Location Picker Placeholder */}
                <div>
                    <label className="input-label mb-2">Pinpoint Location on Map <span className="text-red-500">*</span></label>
                    <div className="w-full h-64 bg-gray-200 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                        {/* <MapPicker onLocationSelect={handleLocationChange} /> 
                            Replace this div with the actual MapPicker component 
                        */}
                        <MapPin className="w-6 h-6 mr-2" />
                        {location ? `Location Selected: Lat ${location.lat.toFixed(4)}, Lng ${location.lng.toFixed(4)}` : "Click here to select location on map"}
                    </div>
                    {/* Mock location selection */}
                    {!location && (
                        <button type="button" onClick={() => handleLocationChange({lat: 40.7128, lng: -74.0060})} className="text-sm text-blue-600 mt-2 block hover:underline">
                            [Click to mock select a location]
                        </button>
                    )}
                </div>

                {/* Image Upload */}
                <div>
                    <label htmlFor="image" className="input-label">Photo Evidence (Optional)</label>
                    <div className="input-group">
                        <Camera className="input-icon" />
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {imageFile && (
                        <p className="text-sm text-gray-600 mt-2">File selected: {imageFile.name}</p>
                    )}
                </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-100">
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Report...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Report
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;