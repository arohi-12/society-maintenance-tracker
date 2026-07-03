import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import {
  FileWarning,
  Upload,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const RaiseComplaint = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    'Plumbing',
    'Electrical',
    'Elevator/Lift',
    'Security',
    'Cleanliness & Waste',
    'Carpentry',
    'Parking',
    'Gardening & Landscaping',
    'General Maintenance',
    'Others'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit. Please choose a smaller image.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files (JPEG, PNG, WEBP) are supported.');
        return;
      }
      setError('');
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!category) {
      setError('Please select a complaint category.');
      return;
    }
    if (!description || description.trim().length < 10) {
      setError('Please provide a description of at least 10 characters.');
      return;
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    }

    setIsSubmitting(true);
    try {
      await complaintAPI.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/resident/dashboard#complaints');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div class="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/resident/dashboard')}
        class="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft class="h-4 w-4" />
        <span>Back to Portal</span>
      </button>

      {/* Title Header */}
      <div>
        <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">Raise a Maintenance Complaint</h2>
        <p class="text-slate-500 text-sm mt-1">Submit your maintenance request below. Our estate team will review it shortly.</p>
      </div>

      {success ? (
        <div class="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-3 shadow-sm">
          <div class="inline-flex bg-emerald-100 text-emerald-600 p-4 rounded-full">
            <CheckCircle2 class="h-10 w-10" />
          </div>
          <h3 class="text-lg font-bold text-slate-800">Complaint Submitted Successfully!</h3>
          <p class="text-slate-500 text-sm max-w-sm mx-auto">Your complaint has been logged and the tracking timeline is active. Redirecting you to your history...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          {error && (
            <div class="flex items-start gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-700 text-sm">
              <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector */}
          <div class="space-y-2">
            <label class="block text-slate-700 text-sm font-bold" htmlFor="category">
              Category <span class="text-rose-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all font-semibold text-sm cursor-pointer"
            >
              <option value="" disabled>Select category (e.g. Plumbing, Electrical)</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description Input */}
          <div class="space-y-2">
            <label class="block text-slate-700 text-sm font-bold" htmlFor="description">
              Describe the Issue <span class="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Provide a detailed explanation. (e.g. Water leaking in kitchen under sink, toilet flushing slowly, main corridor lights are flickering...)"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all font-medium text-sm leading-relaxed"
            />
          </div>

          {/* File Upload Zone */}
          <div class="space-y-2">
            <label class="block text-slate-700 text-sm font-bold">
              Supporting Photo <span class="text-slate-400 font-normal">(Optional)</span>
            </label>

            {!photoPreview ? (
              <div class="border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-colors rounded-2xl p-8 text-center bg-slate-50/50 cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div class="flex flex-col items-center justify-center gap-3">
                  <div class="bg-indigo-50 text-indigo-600 p-3 rounded-full group-hover:bg-indigo-100 transition-colors">
                    <Upload class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-700">Click or Drag & Drop Photo Here</p>
                    <p class="text-xs text-slate-400 font-semibold mt-1">PNG, JPG, JPEG, WEBP (Max 5MB)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div class="relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex flex-col items-center justify-center p-4">
                <img
                  src={photoPreview}
                  alt="Complaint Preview"
                  class="max-h-64 object-contain rounded-xl border border-slate-200"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  class="absolute top-6 right-6 p-2 bg-slate-900/80 hover:bg-slate-950 text-white rounded-full transition-colors cursor-pointer shadow-md"
                >
                  <X class="h-4 w-4" />
                </button>
                <div class="flex items-center gap-2 mt-3 text-xs text-slate-500 font-semibold">
                  <ImageIcon class="h-4 w-4 text-indigo-500" />
                  <span>Selected file: {photo.name} ({(photo.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div class="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/resident/dashboard')}
              class="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 font-bold rounded-2xl text-slate-700 text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="flex-2 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>Submitting Complaint...</span>
                </>
              ) : (
                <span>Submit Complaint</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RaiseComplaint;
