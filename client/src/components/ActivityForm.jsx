import React, { useState, useMemo } from 'react';
import {
  Car,
  Bike,
  Bus,
  Train,
  Plane,
  Flame,
  Zap,
  TreePine,
  Box,
  Salad,
  Utensils,
  PlusCircle,
  AlertOctagon,
  Calendar,
  FileText,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { ACTIVITY_CONFIG, formatCo2 } from '../utils/formatters';

const TYPE_ICONS = {
  car: Car,
  bike: Bike,
  bus: Bus,
  train: Train,
  flight: Plane,
  lpg: Flame,
  electricity: Zap,
  wood: TreePine,
  coal: Box,
  veg_meal: Salad,
  non_veg_meal: Utensils,
};

export default function ActivityForm({ onActivityAdded, onSuccessToast }) {
  const [type, setType] = useState('car');
  const [quantity, setQuantity] = useState('10');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Decision Point 2 (DP2): Absurd Input Modal State
  const [absurdModal, setAbsurdModal] = useState({
    isOpen: false,
    message: '',
    value: '',
    threshold: 0,
    unit: '',
  });

  const currentConfig = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.car;
  const ActiveIcon = TYPE_ICONS[type] || Car;

  // Real-time calculation preview
  const previewCalculation = useMemo(() => {
    const num = parseFloat(quantity);
    if (isNaN(num) || num <= 0) return null;
    const co2 = Number((num * currentConfig.factor).toFixed(2));
    return {
      quantity: num,
      unit: currentConfig.unit,
      factor: currentConfig.factor,
      co2,
      formula: `${num} ${currentConfig.unit} × ${currentConfig.factor.toFixed(2)} kg/${currentConfig.unit} = ${formatCo2(co2)} kg CO₂`,
    };
  }, [quantity, currentConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessResult(null);

    const num = parseFloat(quantity);

    // Basic frontend checks
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid quantity greater than 0.');
      return;
    }

    // Decision Point 2 (DP2): Frontend Absurd Input Interception
    if (num > currentConfig.maxThreshold) {
      const unitWord = currentConfig.unit === 'km' ? 'distance' : 'quantity';
      setAbsurdModal({
        isOpen: true,
        message: `This value looks unusually high. Please check the ${unitWord} before saving this activity.`,
        value: num,
        threshold: currentConfig.maxThreshold,
        unit: currentConfig.unit,
      });
      return; // Do not save!
    }

    try {
      setSubmitting(true);
      const res = await api.createActivity({
        type,
        quantity: num,
        date,
        note,
      });

      if (res.success) {
        setSuccessResult({
          message: res.message,
          data: res.data,
          breakdown: res.calculationBreakdown,
        });

        if (onSuccessToast) {
          onSuccessToast(`Activity logged successfully — ${formatCo2(res.data.co2)} kg CO₂ added.`);
        }

        if (onActivityAdded) {
          onActivityAdded(res.data);
        }

        // Reset fields
        setNote('');
      }
    } catch (err) {
      // If backend also rejects as absurd input (DP2 dual validation)
      if (err.isAbsurdInput) {
        setAbsurdModal({
          isOpen: true,
          message: err.message,
          value: num,
          threshold: err.maxThreshold || currentConfig.maxThreshold,
          unit: err.unit || currentConfig.unit,
        });
      } else {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Log Activity</h2>
          <p className="text-xs text-slate-500">
            Record everyday travel, power, or food choices to calculate deterministic CO₂
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Type Selection Tabs / Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Activity Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.values(ACTIVITY_CONFIG).map((cfg) => {
              const Icon = TYPE_ICONS[cfg.key] || Car;
              const isSelected = type === cfg.key;
              return (
                <button
                  key={cfg.key}
                  type="button"
                  onClick={() => setType(cfg.key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs truncate">{cfg.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {cfg.factor} kg / {cfg.unit}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity with Dynamic Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Quantity ({currentConfig.unit})
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-16 font-medium text-slate-900"
                placeholder={`e.g. 10`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {currentConfig.unit}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Limit: up to {currentConfig.maxThreshold.toLocaleString()} {currentConfig.unit} per entry
            </p>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Date
            </label>
            <div className="relative rounded-xl shadow-xs">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select any day within this or previous weeks
            </p>
          </div>
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Optional Note / Description
          </label>
          <div className="relative">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={150}
              placeholder="e.g. Office commute, Home air-conditioning, Lunch with colleagues"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
            />
          </div>
        </div>

        {/* Feature 2: Transparent Calculation Breakdown Preview */}
        {previewCalculation && (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold uppercase tracking-wider text-[11px]">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Transparent CO₂ Calculation Preview</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-mono text-slate-700 text-xs sm:text-sm">
                <span className="font-bold text-slate-900">{previewCalculation.quantity} {previewCalculation.unit}</span>
                {' × '}
                <span className="text-slate-600">{previewCalculation.factor.toFixed(2)} kg/{previewCalculation.unit}</span>
                {' = '}
                <span className="font-extrabold text-emerald-700 text-base">{formatCo2(previewCalculation.co2)} kg CO₂</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-medium bg-emerald-100/80 px-2 py-0.5 rounded-md self-start sm:self-auto">
                Official Factor
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Success confirmation card */}
        {successResult && (
          <div className="p-4 rounded-xl bg-emerald-100/60 border border-emerald-300 text-xs text-emerald-950 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">{successResult.message}</p>
              {successResult.breakdown && (
                <p className="font-mono text-xs text-emerald-800 mt-1">
                  Formula applied: {successResult.breakdown.formula}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Activity to MongoDB...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Log Activity & Calculate Impact</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Decision Point 2 (DP2): Absurd Input Validation Modal */}
      {absurdModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Unusually High Value Detected
                </h3>
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                  Decision Point 2 (DP2) Rejection
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900 text-sm">
                "This value looks unusually high."
              </p>
              <p>
                Please check the {absurdModal.unit === 'km' ? 'distance' : 'quantity'} before saving this activity.
              </p>
              <div className="pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-600">
                <span>Entered: <strong>{absurdModal.value} {absurdModal.unit}</strong></span>
                <span className="mx-2">•</span>
                <span>Max Allowed: <strong>{absurdModal.threshold.toLocaleString()} {absurdModal.unit}</strong></span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Reason: Obvious outlier entries distort carbon averages and weekly targets. CarbonMap rejects unrealistic inputs on both frontend and backend.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAbsurdModal({ ...absurdModal, isOpen: false })}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setAbsurdModal({ ...absurdModal, isOpen: false });
                  // Focus and let user edit
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                Edit Value
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
