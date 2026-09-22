import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Filter,
  Calendar,
  Layers,
  PlusCircle,
  Database,
  ArrowUpDown,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import ActivityTable from '../components/ActivityTable';
import LoadingState from '../components/LoadingState';
import { formatCo2 } from '../utils/formatters';

const ACTIVITY_FILTER_OPTIONS = [
  { value: 'all', label: 'All Activities' },
  { value: 'car', label: 'Car Travel' },
  { value: 'bus', label: 'Bus Travel' },
  { value: 'flight', label: 'Flight' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'veg_meal', label: 'Vegetarian Meal' },
  { value: 'non_veg_meal', label: 'Non-Vegetarian Meal' },
];

const PERIOD_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

export default function History() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [toastMsg, setToastMsg] = useState('');
  const [isDeletingId, setIsDeletingId] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedType !== 'all') params.type = selectedType;

      if (selectedPeriod === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      } else if (selectedPeriod) {
        params.period = selectedPeriod;
      }

      const res = await api.getActivities(params);
      if (res.success) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedPeriod, startDate, endDate]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleDeleteActivity = async (id) => {
    try {
      setIsDeletingId(id);
      const res = await api.deleteActivity(id);
      if (res.success) {
        showToast('Activity deleted successfully.');
        setActivities((prev) => prev.filter((act) => act._id !== id));
      }
    } catch (err) {
      showToast('Failed to delete activity.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const totalFilteredCo2 = activities.reduce((acc, curr) => acc + (curr.co2 || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HistoryIcon className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Activity History & Filters
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse, filter, and audit all recorded environmental activities stored in MongoDB
          </p>
        </div>

        <Link
          to="/log-activity"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Activity</span>
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter: Activity Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            >
              {ACTIVITY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Period */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Date Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range if selected */}
          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </>
          )}
        </div>

        {/* Filter Summary Pill */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Showing:</span>
            <span className="font-bold text-slate-900">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </span>
            {(selectedType !== 'all' || selectedPeriod) && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedPeriod('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline text-[11px]"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Filtered Total:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-mono">
              {formatCo2(totalFilteredCo2)} kg CO₂
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      {loading ? (
        <LoadingState message="Fetching activity records from MongoDB..." />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <p className="text-xs font-semibold text-rose-700">{error}</p>
          <button
            onClick={fetchActivities}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200/80 text-center shadow-card max-w-lg mx-auto">
          <p className="text-sm font-bold text-slate-800 mb-1">No activities found</p>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your type or date filter criteria, or log a new activity.
          </p>
          <Link
            to="/log-activity"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Activity</span>
          </Link>
        </div>
      ) : (
        <ActivityTable
          activities={activities}
          onDeleteActivity={handleDeleteActivity}
          isDeletingId={isDeletingId}
        />
      )}
    </div>
  );
}
