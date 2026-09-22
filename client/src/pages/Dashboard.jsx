import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Calendar,
  Target,
  Sparkles,
  PlusCircle,
  Database,
  ArrowRight,
  TrendingDown,
  Clock,
  Car,
  Zap,
  Salad,
  CheckCircle2,
  Sun,
} from 'lucide-react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import CarbonTrendChart from '../components/CarbonTrendChart';
import CategoryChart from '../components/CategoryChart';
import WeeklyTarget from '../components/WeeklyTarget';
import NudgeBanner from '../components/NudgeBanner';
import EcoCoach from '../components/EcoCoach';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { formatCo2, formatDate, getActivityMeta } from '../utils/formatters';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Running live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      if (res.success) {
        setDashboardData(res.data);
        // Automatically sync legacy 20 kg targets to requested Daily 5.5 kg / Weekly 38.5 kg
        if (Number(res.data?.stats?.weeklyTarget) === 20 || !res.data?.stats?.dailyTarget) {
          try {
            await api.updateTarget({ weeklyTarget: 38.5, dailyTarget: 5.5 });
            const updated = await api.getDashboard();
            if (updated.success) setDashboardData(updated.data);
          } catch (e) {
            console.warn('Target auto-sync note:', e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Something went wrong loading your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLoadDemoData = async () => {
    try {
      setLoadingDemo(true);
      const res = await api.seedDemoData(true);
      if (res.success) {
        showToast('Demo data loaded successfully!');
        await loadData();
      }
    } catch (err) {
      showToast('Failed to load demo data.');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleTargetUpdated = async (targetPayload) => {
    const res = await api.updateTarget(targetPayload);
    const weekly = res.data?.weeklyTarget ?? (typeof targetPayload === 'object' ? targetPayload.weeklyTarget : targetPayload);
    const daily = res.data?.dailyTarget ?? (typeof targetPayload === 'object' ? targetPayload.dailyTarget : (weekly / 7));
    showToast(`Carbon limits updated: Daily ${formatCo2(daily)} kg, Weekly ${formatCo2(weekly)} kg.`);
    await loadData();
  };

  if (loading && !dashboardData) {
    return <LoadingState message="Loading your carbon footprint..." />;
  }

  if (error && !dashboardData) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, weekInfo, trendData, categoryBreakdown, nudge, recentActivities } = dashboardData;
  const hasActivities = (stats?.totalActivitiesCount || 0) > 0;

  // Carbon Limit Baselines (Daily: 5.5 kg CO₂e, Weekly: 38.5 kg CO₂e)
  const dailyLimit = Number(stats?.dailyTarget || 5.5);
  const weeklyLimit = (Number(stats?.weeklyTarget) && Number(stats?.weeklyTarget) !== 20)
    ? Number(stats?.weeklyTarget)
    : 38.5;

  // Compute Today's emission metrics
  const todayDateStr = new Date().toISOString().split('T')[0];
  const localDayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayTrend = trendData?.find((d) => d.date === todayDateStr || d.day === localDayShort);
  const todayTotal = stats?.todayTotal !== undefined ? stats.todayTotal : (todayTrend?.co2 || 0);
  const todayCount = stats?.todayActivitiesCount !== undefined ? stats.todayActivitiesCount : (todayTrend?.activitiesCount || 0);

  const isDailyExceeded = todayTotal > dailyLimit;
  const todayRemaining = Number(Math.max(0, dailyLimit - todayTotal).toFixed(2));
  const dailyPercent = dailyLimit > 0 ? Number(((todayTotal / dailyLimit) * 100).toFixed(1)) : 0;

  const isWeeklyExceeded = (stats?.weeklyTotal || 0) > weeklyLimit;
  const weeklyPercent = weeklyLimit > 0 ? Number((((stats?.weeklyTotal || 0) / weeklyLimit) * 100).toFixed(1)) : 0;

  // Live running formatted date & time (e.g., Tuesday, 22 Sep 2026 | 05:02:25 PM)
  const formattedLiveDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedLiveTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header (Section 10) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Carbon Footprint
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Tracker
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Track your everyday choices and understand the impact.
          </p>
          {/* Decision Point 3 (DP3): The Week indicator and Live Running Date/Time */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-800">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 inline-flex items-center gap-1.5 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>This Week (Monday → Sunday): <strong className="font-extrabold text-emerald-900">{weekInfo?.formattedRange}</strong></span>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-xs text-xs">
              <span className="font-extrabold text-slate-800 tracking-tight">
                {formattedLiveDate}
              </span>
              <span className="text-slate-300 font-bold">|</span>
              <span className="inline-flex items-center gap-1.5 font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/70 tracking-tight">
                <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{formattedLiveTime}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadDemoData}
            disabled={loadingDemo}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Pre-populate realistic weekly demo activities"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>{loadingDemo ? 'Loading...' : 'Load Demo Data'}</span>
          </button>

          <Link
            to="/log-activity"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Activity</span>
          </Link>
        </div>
      </div>

      {/* Decision Point 1 (DP1): The Nudge Banner */}
      <NudgeBanner nudge={nudge} />

      {/* 4 Stat Cards: Total Carbon Today, This Week, Weekly Limit, Remaining Today */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Tab 1: Total Carbon Today */}
        <StatCard
          icon={Sun}
          label="Total Carbon Today"
          value={formatCo2(todayTotal)}
          supportingText={`Daily limit: ${formatCo2(dailyLimit)} kg CO₂e`}
          badgeText={isDailyExceeded ? 'Exceeded' : `${dailyPercent}% used`}
          variant={isDailyExceeded ? 'danger' : 'accent'}
        />

        {/* Tab 2: This Week */}
        <StatCard
          icon={Calendar}
          label="This Week"
          value={formatCo2(stats.weeklyTotal)}
          supportingText="Monday — Sunday"
          badgeText={isWeeklyExceeded ? 'Exceeded' : 'On Track'}
          variant={isWeeklyExceeded ? 'danger' : 'accent'}
        />

        {/* Tab 3: Weekly Limit */}
        <StatCard
          icon={Target}
          label="Weekly Limit"
          value={formatCo2(weeklyLimit)}
          supportingText={`Daily limit: ${formatCo2(dailyLimit)} kg CO₂e`}
          badgeText={`${weeklyPercent}% used`}
          variant="default"
        />

        {/* Tab 4: Remaining Today */}
        <StatCard
          icon={TrendingDown}
          label="Remaining Today"
          value={formatCo2(todayRemaining)}
          supportingText={isDailyExceeded ? `Over by ${formatCo2(todayTotal - dailyLimit)} kg` : `Daily limit: ${formatCo2(dailyLimit)} kg CO₂e`}
          badgeText={isDailyExceeded ? '0.00 kg' : 'Allowance'}
          variant={isDailyExceeded ? 'warning' : 'default'}
        />
      </div>

      {/* Empty State vs Full Dashboard View */}
      {!hasActivities ? (
        <EmptyState onLoadDemoData={handleLoadDemoData} isLoadingDemo={loadingDemo} />
      ) : (
        <>
          {/* Charts Row (Section 12 & 13) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CarbonTrendChart data={trendData} dailyLimit={dailyLimit} />
            </div>
            <div className="lg:col-span-1">
              <CategoryChart categories={categoryBreakdown} />
            </div>
          </div>

          {/* Target & Eco Coach Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <WeeklyTarget
                weeklyTotal={stats.weeklyTotal}
                weeklyTarget={weeklyLimit}
                dailyTotal={todayTotal}
                dailyTarget={dailyLimit}
                weekInfo={weekInfo}
                onTargetUpdated={handleTargetUpdated}
              />
            </div>
            <div className="lg:col-span-2">
              <EcoCoach refreshTrigger={stats.weeklyTotal} />
            </div>
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Recent Activities</h3>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentActivities?.map((item) => {
                const meta = getActivityMeta(item.type);
                return (
                  <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="font-semibold text-slate-800">{meta.label}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatDate(item.date)} {item.note ? `• ${item.note}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="ml-2 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {formatCo2(item.co2)} kg CO₂
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
