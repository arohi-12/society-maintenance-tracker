import React, { useState, useEffect } from 'react';
import { noticeAPI } from '../services/api';
import {
  Megaphone,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Pin
} from 'lucide-react';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Notice form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await noticeAPI.getAll();
      setNotices(res.data.data);
    } catch (err) {
      setError('Could not load Notice Board announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description) {
      setError('Title and Description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await noticeAPI.create({ title, description, isImportant });
      setSuccess(true);
      setTitle('');
      setDescription('');
      setIsImportant(false);
      // Reload lists
      fetchNotices();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    
    try {
      await noticeAPI.delete(id);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      alert('Failed to remove notice');
    }
  };

  return (
    <div class="space-y-6">
      {/* Page Title */}
      <div>
        <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">Manage Notice Board</h2>
        <p class="text-slate-500 text-sm mt-1">Publish news announcements, broadcast urgent alerts, and archive outdated boards.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Create Form */}
        <div class="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5 sticky top-24"
          >
            <h3 class="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-2 flex items-center gap-2">
              <Megaphone class="h-5 w-5 text-indigo-500" />
              <span>Publish Notice</span>
            </h3>

            {error && (
              <div class="flex items-start gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-700 text-sm">
                <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-700 text-sm">
                <CheckCircle2 class="h-5 w-5 shrink-0" />
                <span>Notice published successfully!</span>
              </div>
            )}

            {/* Title */}
            <div class="space-y-1.5">
              <label class="block text-slate-700 text-sm font-bold" htmlFor="title">
                Notice Title <span class="text-rose-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Water shutdown, AGM Meeting..."
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-medium"
              />
            </div>

            {/* Description */}
            <div class="space-y-1.5">
              <label class="block text-slate-700 text-sm font-bold" htmlFor="description">
                Announcement Body <span class="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Provide notice specifics. (e.g. Schedule, details, links...)"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 focus:outline-none text-sm font-medium leading-relaxed"
              />
            </div>

            {/* Pinned / Important Toggle */}
            <div class="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer">
              <input
                id="isImportant"
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                class="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="isImportant" class="text-slate-700 text-xs font-bold uppercase tracking-wide cursor-pointer">
                Mark as Pinned / Important
              </label>
            </div>

            {isImportant && (
              <p class="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 p-2.5 rounded-xl leading-normal">
                💡 Note: Important notices will remain pinned at the top of the resident Notice Board and will trigger instant email alerts to all residents.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              class="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>Publishing Board...</span>
                </>
              ) : (
                <span>Publish Announcement</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Notices List */}
        <div class="lg:col-span-3 space-y-4">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <h3 class="font-extrabold text-slate-800 text-lg border-b border-slate-50 pb-4 mb-4">
              Published Notices Board
            </h3>

            {loading ? (
              <div class="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 class="h-6 w-6 animate-spin text-indigo-600" />
                <p class="text-sm font-medium">Fetching Notice lists...</p>
              </div>
            ) : notices.length === 0 ? (
              <div class="text-center text-slate-400 py-12 text-sm font-medium">
                No active announcements published.
              </div>
            ) : (
              <div class="space-y-4">
                {notices.map((notice) => (
                  <div
                    key={notice._id}
                    class={`p-5 rounded-2xl border transition-all ${
                      notice.isImportant
                        ? 'border-rose-200 bg-rose-50/10 shadow-rose-100/10'
                        : 'border-slate-150 hover:shadow-sm'
                    }`}
                  >
                    <div class="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1.5">
                          {notice.isImportant && (
                            <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-rose-600 text-white">
                              <Pin class="h-2.5 w-2.5 rotate-45" /> Pinned
                            </span>
                          )}
                          <h4 class="font-bold text-slate-800 text-sm sm:text-base">{notice.title}</h4>
                        </div>
                        <div class="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                          <Calendar class="h-3 w-3" />
                          <span>{new Date(notice.createdAt).toLocaleString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(notice._id)}
                        class="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 class="h-4.5 w-4.5" />
                      </button>
                    </div>
                    <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {notice.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotices;
