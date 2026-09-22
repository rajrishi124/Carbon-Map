import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, AlertCircle, Edit3, X, Check, Sun } from 'lucide-react';
import { formatCo2 } from '../utils/formatters';

export default function WeeklyTarget({
  weeklyTotal = 0,
  weeklyTarget = 38.5,
  dailyTotal = 0,
  dailyTarget = 5.5,
  weekInfo = {},
  onTargetUpdated,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editWeekly, setEditWeekly] = useState(weeklyTarget.toString());
  const [editDaily, setEditDaily] = useState(dailyTarget.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isWeeklyExceeded = weeklyTotal > weeklyTarget;
  const isDailyExceeded = dailyTotal > dailyTarget;
  const weeklyProgressPercent = weeklyTarget > 0 ? (weeklyTotal / weeklyTarget) * 100 : 0;
  const clampedWeeklyProgress = Math.min(100, Math.max(0, weeklyProgressPercent));

  const dailyProgressPercent = dailyTarget > 0 ? (dailyTotal / dailyTarget) * 100 : 0;

  const weeklyDiffKg = Math.abs(weeklyTotal - weeklyTarget);
  const dailyDiffKg = Math.abs(dailyTotal - dailyTarget);

  // Status for Weekly
  let weeklyStatus = 'normal';
  if (isWeeklyExceeded) {
    weeklyStatus = 'exceeded';
  } else if (weeklyProgressPercent >= 80) {
    weeklyStatus = 'near';
  }

  const handleWeeklyInputChange = (val) => {
    setEditWeekly(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setEditDaily((num / 7).toFixed(1));
    }
  };

  const handleDailyInputChange = (val) => {
    setEditDaily(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setEditWeekly((num * 7).toFixed(1));
    }
  };

  const handleSaveTarget = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const numWeekly = parseFloat(editWeekly);
    const numDaily = parseFloat(editDaily);

    if (isNaN(numWeekly) || numWeekly <= 0 || isNaN(numDaily) || numDaily <= 0) {
      setErrorMsg('Limits must be greater than 0');
      return;
    }
    if (numWeekly > 5000) {
      setErrorMsg('Weekly target cannot exceed 5,000 kg');
      return;
    }

    try {
      setIsSubmitting(true);
      await onTargetUpdated({ weeklyTarget: numWeekly, dailyTarget: numDaily });
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update limits');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = () => {
    switch (weeklyStatus) {
      case 'exceeded':
        return {
          barColor: 'bg-rose-500',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          textColor: 'text-rose-700',
          icon: AlertCircle,
          label: 'Weekly Limit Exceeded',
          message: `Weekly limit exceeded by ${formatCo2(weeklyDiffKg)} kg.`,
        };
      case 'near':
        return {
          barColor: 'bg-amber-500',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          textColor: 'text-amber-700',
          icon: AlertTriangle,
          label: 'Near Weekly Limit',
          message: `Approaching weekly limit (${weeklyProgressPercent.toFixed(0)}% used).`,
        };
      default:
        return {
          barColor: 'bg-emerald-500',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          textColor: 'text-emerald-700',
          icon: CheckCircle2,
          label: 'Within Limit',
          message: "You're within your weekly carbon limit.",
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Carbon Limits & Goals</h3>
          </div>
          {/* Decision Point 3 (DP3): Mid-week progress and day indicator */}
          <p className="text-xs text-slate-500 mt-0.5">
            {weekInfo.label || 'Monday — Sunday'} • {weekInfo.formattedRange || 'Current Week'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeBg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>
          {!isEditing && (
            <button
              onClick={() => {
                setEditWeekly(weeklyTarget.toString());
                setEditDaily(dailyTarget.toString());
                setIsEditing(true);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit carbon limits"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Target editor form */}
      {isEditing ? (
        <form onSubmit={handleSaveTarget} className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700">Set Carbon Limits</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Daily Limit</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1000"
                  value={editDaily}
                  onChange={(e) => handleDailyInputChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="5.5"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-medium">kg/day</span>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Weekly Limit</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="5000"
                  value={editWeekly}
                  onChange={(e) => handleWeeklyInputChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="38.5"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-medium">kg/wk</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditDaily('5.5');
                setEditWeekly('38.5');
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Reset to 5.5 / 38.5
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Save Limits
            </button>
          </div>
          {errorMsg && <p className="text-xs text-rose-600 mt-2">{errorMsg}</p>}
        </form>
      ) : (
        /* Progress metrics display */
        <div className="my-3 space-y-4">
          {/* Weekly Progress Bar */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Weekly Limit</span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatCo2(weeklyTotal)}
                  </span>
                  <span className="text-sm font-medium text-slate-400">/</span>
                  <span className="text-lg font-bold text-slate-600">
                    {formatCo2(weeklyTarget)} kg CO₂e
                  </span>
                </div>
              </div>
              <span className={`text-base font-extrabold ${config.textColor}`}>
                {weeklyProgressPercent.toFixed(1)}%
              </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
                style={{ width: `${clampedWeeklyProgress}%` }}
              />
            </div>
          </div>

          {/* Daily Limit Micro-Meter */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Daily Limit: {formatCo2(dailyTarget)} kg CO₂e</span>
                <span className="text-[11px] text-slate-500">
                  Today: {formatCo2(dailyTotal)} kg ({dailyProgressPercent.toFixed(0)}% used)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                isDailyExceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isDailyExceeded ? `+${formatCo2(dailyDiffKg)} kg over` : `${formatCo2(dailyDiffKg)} kg left`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Supportive description */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">{config.message}</span>
        <span className="text-slate-400 font-mono">
          {isWeeklyExceeded ? `+${formatCo2(weeklyDiffKg)} kg over` : `${formatCo2(weeklyDiffKg)} kg remaining`}
        </span>
      </div>
    </div>
  );
}
