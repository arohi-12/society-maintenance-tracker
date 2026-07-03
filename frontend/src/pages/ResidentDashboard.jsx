import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { noticeAPI, complaintAPI } from '../services/api';
import {
  Megaphone,
  FileWarning,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ResidentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'notices' or 'complaints'
  const [activeTab, setActiveTab] = useState('notices');
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [error, setError] = useState('');

  // Handle URL hash routing (#complaints)
  useEffect(() => {
    if (location.hash === '#complaints') {
      setActiveTab('complaints');
    } else {
      setActiveTab('notices');
    }
  }, [location.hash]);

  const fetchData = async () => {
    try {
      setError('');
      // Fetch notices
      setLoadingNotices(true);
      const noticeRes = await noticeAPI.getAll();
      setNotices(noticeRes.data.data);
      setLoadingNotices(false);

      // Fetch complaints
      setLoadingComplaints(true);
      const complaintRes = await complaintAPI.getAll();
      setComplaints(complaintRes.data.data);
      setLoadingComplaints(false);
    } catch (err) {
      setError('Could not fetch portal data. Please try again.');
      setLoadingNotices(false);
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
            <AlertTriangle class="h-3 w-3 animate-pulse" /> In Progress
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
        return <span class="text-rose-600 bg-rose-50 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">High</span>;
      case 'Medium':
        return <span class="text-amber-600 bg-amber-50 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Medium</span>;
      case 'Low':
        return <span class="text-slate-600 bg-slate-50 border border-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div class="space-y-6">
      {/* Top Banner Summary */}
      <div class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="space-y-2">
          <span class="bg-white/20 text-white border border-white/10 text-xs font-semibold tracking-wider px-3 py-1 rounded-full uppercase">
            Resident Hub
          </span>
          <h2 class="text-3xl font-extrabold font-sans">Welcome to your Portal, {user?.name}</h2>
          <p class="text-indigo-100 text-sm max-w-xl">
            Raise complaints, view resolution history timelines, check notices, and monitor status updates instantly.
          </p>
        </div>
        <button
          onClick={() => navigate('/resident/raise-complaint')}
          class="flex items-center gap-2 px-5 py-3.5 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer text-sm shrink-0"
        >
          <Plus class="h-5 w-5" />
          <span>Raise Complaint</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div class="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('notices');
            navigate('/resident/dashboard');
          }}
          class={`flex items-center gap-2.5 pb-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone class="h-4.5 w-4.5" />
          <span>Notice Board</span>
          {!loadingNotices && notices.length > 0 && (
            <span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {notices.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('complaints');
            navigate('/resident/dashboard#complaints');
          }}
          class={`flex items-center gap-2.5 pb-4 px-6 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'complaints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileWarning class="h-4.5 w-4.5" />
          <span>My Complaints</span>
          {!loadingComplaints && complaints.length > 0 && (
            <span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {complaints.length}
            </span>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div class="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm">
          <AlertCircle class="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Notices Content */}
      {activeTab === 'notices' && (
        <div class="space-y-4">
          {loadingNotices ? (
            <div class="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
              <p class="text-sm font-medium">Loading Notice Board announcements...</p>
            </div>
          ) : notices.length === 0 ? (
            <div class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto mt-6">
              <div class="inline-flex bg-slate-100 text-slate-400 p-4 rounded-full mb-4">
                <Megaphone class="h-8 w-8" />
              </div>
              <h3 class="font-bold text-lg text-slate-800">Notice Board is Empty</h3>
              <p class="text-slate-500 text-sm mt-1">There are no notices published by the management office currently.</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 gap-5">
              {notices.map((notice) => (
                <div
                  key={notice._id}
                  class={`p-6 rounded-3xl bg-white shadow-sm border transition-all duration-300 ${
                    notice.isImportant
                      ? 'border-rose-200 bg-rose-50/10 shadow-rose-200/5 hover:shadow-rose-200/10'
                      : 'border-slate-100 hover:shadow-md hover:shadow-slate-100/50'
                  }`}
                >
                  <div class="flex justify-between items-start gap-4 flex-wrap mb-3">
                    <div class="flex items-center gap-2.5">
                      {notice.isImportant && (
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-600 text-white animate-pulse">
                          📌 Important Notice
                        </span>
                      )}
                      <h3 class="text-lg font-bold text-slate-800 font-sans">{notice.title}</h3>
                    </div>
                    <div class="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <Calendar class="h-3.5 w-3.5" />
                      <span>{new Date(notice.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                  <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {notice.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complaints Content */}
      {activeTab === 'complaints' && (
        <div class="space-y-4">
          {loadingComplaints ? (
            <div class="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
              <p class="text-sm font-medium">Loading your complaints list...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto mt-6">
              <div class="inline-flex bg-slate-100 text-slate-400 p-4 rounded-full mb-4">
                <FileWarning class="h-8 w-8" />
              </div>
              <h3 class="font-bold text-lg text-slate-800">No Complaints Registered</h3>
              <p class="text-slate-500 text-sm mt-1">If you have plumbing, maintenance, or security issues, you can file a complaint.</p>
              <button
                onClick={() => navigate('/resident/raise-complaint')}
                class="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                File a Complaint
              </button>
            </div>
          ) : (
            <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div class="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => navigate(`/complaints/${c._id}`)}
                    class="flex items-center justify-between p-5 hover:bg-slate-50/50 cursor-pointer transition-colors duration-150 group"
                  >
                    <div class="flex items-start gap-4 min-w-0 pr-4">
                      <div class="hidden sm:flex shrink-0 bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                        <FileWarning class="h-5 w-5" />
                      </div>
                      <div class="min-w-0 space-y-1.5">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="font-bold text-slate-800 text-sm sm:text-base">{c.category}</span>
                          {getPriorityBadge(c.priority)}
                        </div>
                        <p class="text-slate-500 text-sm truncate max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl font-medium">
                          {c.description}
                        </p>
                        <div class="flex items-center gap-2.5 text-xs text-slate-400 font-semibold">
                          <span>ID: {c._id.slice(-6).toUpperCase()}</span>
                          <span>•</span>
                          <span>{new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                      {getStatusBadge(c.currentStatus)}
                      <ChevronRight class="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
