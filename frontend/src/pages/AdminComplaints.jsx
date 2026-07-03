import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import {
  FileWarning,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  RefreshCw,
  Loader2,
  Calendar,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State (bind to URL queries)
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');

  // Modal State for updating status
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await complaintAPI.getAll(params);
      setComplaints(res.data.data);
    } catch (err) {
      setError('Could not fetch complaints. Please verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // Sync filters to URL parameters for bookmarkability
    const newParams = {};
    if (categoryFilter) newParams.category = categoryFilter;
    if (statusFilter) newParams.status = statusFilter;
    if (dateFilter) newParams.date = dateFilter;
    setSearchParams(newParams);
  }, [categoryFilter, statusFilter, dateFilter]);

  const handlePriorityChange = async (id, priority) => {
    try {
      await complaintAPI.updatePriority(id, priority);
      // Refresh list locally
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, priority } : c))
      );
    } catch (err) {
      alert('Failed to update priority');
    }
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.currentStatus);
    setStatusNote('');
  };

  const closeStatusModal = () => {
    setSelectedComplaint(null);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdatingStatus(true);
    try {
      await complaintAPI.updateStatus(
        selectedComplaint._id,
        newStatus,
        statusNote
      );
      closeStatusModal();
      // Reload complaints list
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
    setDateFilter('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return (
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
            <Clock class="h-3 w-3" /> Open
          </span>
        );
      case 'In Progress':
        return (
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
            <AlertTriangle class="h-3 w-3 animate-pulse" /> In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle class="h-3 w-3" /> Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div class="space-y-6">
      {/* Page Title */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">Complaints Manager</h2>
          <p class="text-slate-500 text-sm mt-1">Review active complaints, escalate priorities, and update lifecycle statuses.</p>
        </div>
        <button
          onClick={fetchComplaints}
          class="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-100 font-bold rounded-xl text-slate-700 text-sm transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw class="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filtering Section Card */}
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div class="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-50 pb-2">
          <Filter class="h-4.5 w-4.5 text-indigo-500" />
          <span>Filter Complaints</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div class="space-y-1.5">
            <label class="block text-slate-500 text-xs font-bold uppercase tracking-wide">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-semibold cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div class="space-y-1.5">
            <label class="block text-slate-500 text-xs font-bold uppercase tracking-wide">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-semibold cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Date Filter */}
          <div class="space-y-1.5">
            <label class="block text-slate-500 text-xs font-bold uppercase tracking-wide">Created Date</label>
            <div class="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-semibold cursor-pointer"
              />
            </div>
          </div>

          {/* Clear Button */}
          <div class="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!categoryFilter && !statusFilter && !dateFilter}
              class="w-full py-2.5 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-slate-600 text-sm transition-colors disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main List Area */}
      {error && (
        <div class="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-sm">
          <AlertCircle class="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div class="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
          <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
          <p class="text-sm font-medium">Filtering complaints database...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto">
          <div class="inline-flex bg-slate-100 text-slate-400 p-4 rounded-full mb-4">
            <FileWarning class="h-8 w-8" />
          </div>
          <h3 class="font-bold text-lg text-slate-800">No Complaints Found</h3>
          <p class="text-slate-500 text-sm mt-1">There are no complaints fitting the search and filter selections.</p>
        </div>
      ) : (
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div
                key={c._id}
                class={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors ${
                  c.isOverdue ? 'bg-amber-50/15 hover:bg-amber-50/30' : ''
                }`}
              >
                {/* Info and Resident info */}
                <div
                  onClick={() => navigate(`/complaints/${c._id}`)}
                  class="flex-1 min-w-0 flex items-start gap-4 cursor-pointer group"
                >
                  <div class="hidden sm:flex shrink-0 bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                    <FileWarning class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      {c.isOverdue && (
                        <span class="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide animate-pulse">
                          ⚠️ Overdue
                        </span>
                      )}
                      <span class="font-bold text-slate-800 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                        {c.category}
                      </span>
                    </div>
                    <p class="text-slate-500 text-sm truncate max-w-xs sm:max-w-md font-medium">
                      {c.description}
                    </p>
                    <div class="flex items-center gap-2 flex-wrap text-xs text-slate-400 font-semibold">
                      <span>By: {c.residentId?.name || 'Resident'}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>
                </div>

                {/* Status/Priority Adjusters */}
                <div class="flex items-center gap-4 flex-wrap shrink-0">
                  {/* Status update btn */}
                  <div class="flex items-center gap-2">
                    {getStatusBadge(c.currentStatus)}
                    <button
                      onClick={() => openStatusModal(c)}
                      class="px-2.5 py-1 text-xs border border-indigo-200 hover:border-indigo-400 font-bold rounded-lg text-indigo-600 bg-white transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </div>

                  {/* Priority dropdown selector */}
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-slate-400 font-bold">Priority:</span>
                    <select
                      value={c.priority}
                      onChange={(e) => handlePriorityChange(c._id, e.target.value)}
                      class="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-bold cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  {/* Open Link */}
                  <button
                    onClick={() => navigate(`/complaints/${c._id}`)}
                    class="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight class="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {selectedComplaint && (
        <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 backdrop-blur-sm">
          <div class="bg-white w-full max-w-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div class="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 class="font-extrabold text-slate-800">Update Complaint Status</h3>
                <p class="text-slate-400 text-xs mt-0.5">ID: {selectedComplaint._id.slice(-6).toUpperCase()} • {selectedComplaint.category}</p>
              </div>
              <button
                onClick={closeStatusModal}
                class="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleStatusSubmit} class="p-6 space-y-4">
              {/* Select Status */}
              <div class="space-y-1.5">
                <label class="block text-slate-600 text-xs font-bold uppercase tracking-wider">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-semibold cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Note input */}
              <div class="space-y-1.5">
                <label class="block text-slate-600 text-xs font-bold uppercase tracking-wider">Action Notes</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={4}
                  placeholder="Optional log comments (e.g. Electrician scheduled for Monday, spare parts ordered, issue resolved by tightening pipe joint...)"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-medium leading-normal"
                />
              </div>

              {/* Action buttons */}
              <div class="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  class="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 font-bold rounded-xl text-slate-600 text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  {isUpdatingStatus ? (
                    <Loader2 class="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Save Update</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
