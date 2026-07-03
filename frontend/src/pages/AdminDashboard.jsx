import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import {
  LayoutDashboard,
  FileWarning,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Inbox,
  Loader2,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      setError('Could not load dashboard statistics. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div class="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 class="h-8 w-8 animate-spin text-indigo-600" />
        <p class="text-sm font-medium">Loading society maintenance insights...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div class="flex items-center gap-3 bg-red-50 border border-red-100 p-6 rounded-3xl text-red-700 text-sm shadow-sm max-w-lg mx-auto">
        <AlertCircle class="h-5 w-5 shrink-0" />
        <span>{error || 'Database connection error.'}</span>
      </div>
    );
  }

  // Calculate percentages for status charts
  const total = stats.totalComplaints || 0;
  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div class="space-y-8">
      {/* Top Welcome Title */}
      <div>
        <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">System Analytics</h2>
        <p class="text-slate-500 text-sm mt-1">Review live metrics, monitor overdue tickets, and track category distributions.</p>
      </div>

      {/* KPI Stats Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Complaints */}
        <div
          onClick={() => navigate('/admin/complaints')}
          class="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 relative overflow-hidden group"
        >
          <div class="absolute -right-6 -bottom-6 text-slate-100/50 group-hover:scale-110 transition-transform">
            <Inbox class="h-24 w-24" />
          </div>
          <div class="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl inline-block">
            <Inbox class="h-6 w-6" />
          </div>
          <div>
            <h4 class="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Complaints</h4>
            <p class="text-3xl font-extrabold text-slate-800 mt-1">{total}</p>
          </div>
        </div>

        {/* Open Complaints */}
        <div
          onClick={() => navigate('/admin/complaints?status=Open')}
          class="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 relative overflow-hidden group"
        >
          <div class="absolute -right-6 -bottom-6 text-slate-100/50 group-hover:scale-110 transition-transform">
            <Clock class="h-24 w-24" />
          </div>
          <div class="bg-blue-50 text-blue-600 p-2.5 rounded-2xl inline-block">
            <Clock class="h-6 w-6" />
          </div>
          <div>
            <h4 class="text-slate-400 font-bold text-xs uppercase tracking-wider">Open (Pending)</h4>
            <div class="flex items-baseline gap-2 mt-1">
              <p class="text-3xl font-extrabold text-slate-800">{stats.byStatus.Open}</p>
              <span class="text-xs text-blue-500 font-bold">({getPercent(stats.byStatus.Open)}%)</span>
            </div>
          </div>
        </div>

        {/* In Progress Complaints */}
        <div
          onClick={() => navigate('/admin/complaints?status=In Progress')}
          class="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 relative overflow-hidden group"
        >
          <div class="absolute -right-6 -bottom-6 text-slate-100/50 group-hover:scale-110 transition-transform">
            <AlertTriangle class="h-24 w-24" />
          </div>
          <div class="bg-amber-50 text-amber-600 p-2.5 rounded-2xl inline-block">
            <AlertTriangle class="h-6 w-6" />
          </div>
          <div>
            <h4 class="text-slate-400 font-bold text-xs uppercase tracking-wider">In Progress</h4>
            <div class="flex items-baseline gap-2 mt-1">
              <p class="text-3xl font-extrabold text-slate-800">{stats.byStatus['In Progress']}</p>
              <span class="text-xs text-amber-500 font-bold">({getPercent(stats.byStatus['In Progress'])}%)</span>
            </div>
          </div>
        </div>

        {/* Resolved Complaints */}
        <div
          onClick={() => navigate('/admin/complaints?status=Resolved')}
          class="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 relative overflow-hidden group"
        >
          <div class="absolute -right-6 -bottom-6 text-slate-100/50 group-hover:scale-110 transition-transform">
            <CheckCircle class="h-24 w-24" />
          </div>
          <div class="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl inline-block">
            <CheckCircle class="h-6 w-6" />
          </div>
          <div>
            <h4 class="text-slate-400 font-bold text-xs uppercase tracking-wider">Resolved</h4>
            <div class="flex items-baseline gap-2 mt-1">
              <p class="text-3xl font-extrabold text-slate-800">{stats.byStatus.Resolved}</p>
              <span class="text-xs text-emerald-500 font-bold">({getPercent(stats.byStatus.Resolved)}%)</span>
            </div>
          </div>
        </div>

        {/* Overdue Complaints */}
        <div
          onClick={() => navigate('/admin/complaints')}
          class="bg-white border border-rose-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-4 relative overflow-hidden group"
        >
          <div class="absolute -right-6 -bottom-6 text-slate-100/50 group-hover:scale-110 transition-transform">
            <AlertTriangle class="h-24 w-24" />
          </div>
          <div class="bg-rose-50 text-rose-600 p-2.5 rounded-2xl inline-block">
            <AlertTriangle class="h-6 w-6 text-rose-600 animate-bounce" />
          </div>
          <div>
            <h4 class="text-slate-400 font-bold text-xs uppercase tracking-wider">Overdue Issues</h4>
            <div class="flex items-baseline gap-2 mt-1">
              <p class="text-3xl font-extrabold text-rose-600">{stats.totalOverdue}</p>
              <span class="text-xs text-rose-500 font-bold">({getPercent(stats.totalOverdue)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Graphics (Grid layout) */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h3 class="font-bold text-slate-850 text-base border-b border-slate-50 pb-2">Status Resolutions</h3>
          <div class="space-y-4">
            {Object.keys(stats.byStatus).map((status, idx) => {
              const count = stats.byStatus[status];
              const pct = getPercent(count);
              const barColors = {
                Open: 'bg-blue-500',
                'In Progress': 'bg-amber-500',
                Resolved: 'bg-emerald-500'
              };
              return (
                <div key={idx} class="space-y-1.5">
                  <div class="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>{status}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div class={`h-full ${barColors[status]} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown list */}
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h3 class="font-bold text-slate-850 text-base border-b border-slate-50 pb-2 flex items-center justify-between">
            <span>Category Frequencies</span>
            <TrendingUp class="h-4 w-4 text-indigo-500" />
          </h3>
          <div class="max-h-64 overflow-y-auto space-y-3.5 pr-2">
            {Object.keys(stats.byCategory).length === 0 ? (
              <div class="text-center text-slate-400 py-12 text-sm font-medium">No category logs available.</div>
            ) : (
              Object.keys(stats.byCategory).map((cat, idx) => {
                const count = stats.byCategory[cat];
                const pct = getPercent(count);
                return (
                  <div key={idx} class="space-y-1">
                    <div class="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>{cat}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
