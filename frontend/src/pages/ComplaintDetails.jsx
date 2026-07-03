import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Shield,
  MessageSquare
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintAPI.getById(id);
      setComplaint(res.data.data.complaint);
      setHistory(res.data.data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return (
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            <Clock class="h-3 w-3" /> Open
          </span>
        );
      case 'In Progress':
        return (
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 animate-pulse">
            <AlertTriangle class="h-3 w-3" /> In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle class="h-3 w-3" /> Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span class="text-rose-600 bg-rose-50 border border-rose-100 text-xs font-bold px-3 py-1 rounded-full uppercase">High Priority</span>;
      case 'Medium':
        return <span class="text-amber-600 bg-amber-50 border border-amber-100 text-xs font-bold px-3 py-1 rounded-full uppercase">Medium Priority</span>;
      case 'Low':
        return <span class="text-slate-600 bg-slate-50 border border-slate-100 text-xs font-bold px-3 py-1 rounded-full uppercase">Low Priority</span>;
      default:
        return null;
    }
  };

  // Helper to color timeline nodes
  const getTimelineMarkerColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500 border-emerald-200 ring-emerald-100';
      case 'In Progress':
        return 'bg-amber-500 border-amber-200 ring-amber-100';
      default:
        return 'bg-indigo-500 border-indigo-200 ring-indigo-100';
    }
  };

  if (loading) {
    return (
      <div class="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
        <p class="text-sm font-medium">Loading resolution details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div class="max-w-2xl mx-auto space-y-6 mt-6">
        <button
          onClick={() => navigate(user.role === 'Admin' ? '/admin/complaints' : '/resident/dashboard')}
          class="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        <div class="flex items-center gap-3 bg-red-50 border border-red-100 p-6 rounded-3xl text-red-700 text-sm shadow-sm">
          <AlertCircle class="h-5 w-5 shrink-0" />
          <span>{error || 'Complaint not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <button
        onClick={() => navigate(user.role === 'Admin' ? '/admin/complaints' : '/resident/dashboard#complaints')}
        class="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft class="h-4 w-4" />
        <span>Back to Portal</span>
      </button>

      {/* Header Info */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="text-xs text-indigo-600 font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Category: {complaint.category}
          </span>
          <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight font-sans mt-2">
            Complaint Details
          </h2>
          <p class="text-slate-400 text-xs font-semibold mt-1">
            Registered: {new Date(complaint.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div class="flex gap-2">
          {getPriorityBadge(complaint.priority)}
          {getStatusBadge(complaint.currentStatus)}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Hand: Core Info Card */}
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h3 class="font-bold text-slate-800 text-base border-b border-slate-50 pb-2">Description</h3>
            <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {complaint.description}
            </p>

            {/* Overdue alert */}
            {complaint.isOverdue && (
              <div class="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold">
                <AlertTriangle class="h-4 w-4 shrink-0 text-amber-600 animate-bounce" />
                <span>This active complaint has stayed open beyond the standard resolution threshold and is marked overdue.</span>
              </div>
            )}
          </div>

          {/* User Profile reference */}
          {user.role === 'Admin' && complaint.residentId && (
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h3 class="font-bold text-slate-800 text-base border-b border-slate-50 pb-2">Submitted By</h3>
              <div class="flex items-center gap-3">
                <div class="bg-slate-100 text-slate-600 p-2.5 rounded-full">
                  <User class="h-5 w-5" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 text-sm">{complaint.residentId.name}</h4>
                  <p class="text-slate-500 text-xs font-semibold">{complaint.residentId.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Photo attachment display */}
          {complaint.photoUrl && (
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                <ImageIcon class="h-5 w-5 text-indigo-500" />
                <span>Supporting Photo Attachment</span>
              </h3>
              <div class="rounded-2xl border border-slate-150 overflow-hidden bg-slate-50">
                <img
                  src={complaint.photoUrl}
                  alt="Attachment"
                  class="w-full max-h-[400px] object-contain mx-auto"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Hand: Interactive Vertical Timeline */}
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 class="font-bold text-slate-800 text-base border-b border-slate-50 pb-4 mb-4">Resolution History Timeline</h3>
            
            <div class="relative pl-6 space-y-6 border-l-2 border-slate-100 ml-3">
              {history.map((step, idx) => (
                <div key={step._id} class="relative">
                  {/* Timeline Dot */}
                  <div
                    class={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 ring-4 ${getTimelineMarkerColor(
                      step.status
                    )}`}
                  ></div>

                  {/* Log Content */}
                  <div class="space-y-1.5">
                    <div class="flex justify-between items-center gap-2">
                      <span class="font-bold text-slate-800 text-xs sm:text-sm bg-slate-100 px-2 py-0.5 rounded-md">
                        {step.status}
                      </span>
                      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(step.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Actor Details */}
                    <div class="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      {step.actorId?.role === 'Admin' ? (
                        <Shield class="h-3.5 w-3.5 text-indigo-500" />
                      ) : (
                        <User class="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>
                        {step.actorId?.name || 'Resident'} ({step.actorId?.role || 'Resident'})
                      </span>
                    </div>

                    {/* Optional Note */}
                    {step.note && (
                      <div class="flex gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100/50 text-xs text-slate-600 leading-relaxed font-medium">
                        <MessageSquare class="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{step.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
