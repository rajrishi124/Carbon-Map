import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  Train,
  Bus,
  Car,
  Bike,
  Footprints,
  Leaf,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  Clock,
  Zap,
  Smartphone,
  TreePine,
  Search,
  PlusCircle,
  Award,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';
import { formatCo2 } from '../utils/formatters';

const MODE_ICONS = {
  train: Train,
  bus: Bus,
  bike: Bike,
  car: Car,
  walking: Footprints,
};

export default function RoutePlanner() {
  const [source, setSource] = useState('Greenwood Suburb, 14th Ave');
  const [destination, setDestination] = useState('Downtown Financial Center, Tower 2');
  const [distanceKm, setDistanceKm] = useState('15');
  const [presets, setPresets] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loggingModeId, setLoggingModeId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [manualDistanceOpen, setManualDistanceOpen] = useState(false);

  // Load Presets on Mount
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await api.getRoutePresets();
        if (res.success && res.data) {
          setPresets(res.data);
        }
      } catch (e) {
        console.warn('Failed to load commute presets:', e);
      }
    }
    loadPresets();
  }, []);

  // Calculate default initial route on load
  useEffect(() => {
    handleCalculateRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculateRoute = async (customSrc, customDst, customDist) => {
    const src = customSrc !== undefined ? customSrc : source;
    const dst = customDst !== undefined ? customDst : destination;
    const dist = customDist !== undefined ? customDist : distanceKm;

    if (!src.trim() || !dst.trim()) return;

    try {
      setLoading(true);
      const res = await api.calculateRoute({
        source: src,
        destination: dst,
        distanceKm: dist ? parseFloat(dist) : null,
      });

      if (res.success && res.data) {
        setRouteResult(res.data);
        setDistanceKm(String(res.data.distanceKm));
      }
    } catch (err) {
      console.error('Route calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setSource(preset.source);
    setDestination(preset.destination);
    setDistanceKm(String(preset.estimatedKm));
    handleCalculateRoute(preset.source, preset.destination, preset.estimatedKm);
  };

  const handleSwapAddresses = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    handleCalculateRoute(destination, temp, distanceKm);
  };

  const handleLogTrip = async (mode) => {
    try {
      setLoggingModeId(mode.id);
      // Map walking to bike or log note
      const activityType = mode.type === 'walking' ? 'bike' : mode.type;
      const co2SavedText = mode.co2Saved > 0 ? ` (Saved ${formatCo2(mode.co2Saved)} kg CO₂ vs car)` : '';

      const res = await api.createActivity({
        type: activityType,
        quantity: mode.distanceKm,
        date: new Date().toISOString().split('T')[0],
        note: `[Eco Route] ${source} → ${destination} via ${mode.name}${co2SavedText}`,
      });

      if (res.success) {
        setToastMessage({
          title: 'Eco Commute Logged Successfully!',
          message: `${mode.name} trip (${mode.distanceKm} km) logged. ${
            mode.co2Saved > 0
              ? `You shaved ${formatCo2(mode.co2Saved)} kg CO₂e compared to driving!`
              : `${formatCo2(mode.co2)} kg CO₂e added.`
          }`,
          co2Saved: mode.co2Saved,
        });

        setTimeout(() => {
          setToastMessage(null);
        }, 5000);
      }
    } catch (err) {
      alert(err.message || 'Failed to log eco commute activity.');
    } finally {
      setLoggingModeId(null);
    }
  };

  const carbonShaved = routeResult?.carbonShaved;
  const recommendedMode = routeResult?.recommendedMode;
  const baseline = routeResult?.baseline;

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 max-w-md animate-in slide-in-from-bottom-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-white text-sm mb-0.5">{toastMessage.title}</p>
            <p className="text-slate-300 leading-relaxed">{toastMessage.message}</p>
            <div className="mt-2.5 flex items-center gap-3">
              <Link
                to="/"
                className="text-emerald-400 font-bold underline hover:text-emerald-300"
              >
                View Dashboard Impact →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Eco Route Planner & Carbon Shaver
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare travel modes, find convenient public transit, and calculate exact CO₂ shaved vs driving
          </p>
        </div>

        {/* Quick Baseline Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>Official Benchmarks:</span>
          <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            Train: 0.04 kg/km
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            Car: 0.20 kg/km
          </span>
        </div>
      </div>

      {/* Origin & Destination Search Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-card space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Commute Route Details</span>
          </div>

          <button
            type="button"
            onClick={() => setManualDistanceOpen(!manualDistanceOpen)}
            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>{manualDistanceOpen ? 'Hide' : 'Fine-Tune'} Distance</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Source Address */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Starting Point (Source)
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Home, Sector 15, Station"
                className="w-full pl-9.5 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex items-center justify-center pt-2 md:pt-4">
            <button
              type="button"
              onClick={handleSwapAddresses}
              title="Swap Origin and Destination"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200/80 transition-all hover:scale-105 shadow-2xs"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Address */}
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
              Destination Address
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Office Tower, City Airport, University"
                className="w-full pl-9.5 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Manual Distance Override if toggled */}
        {manualDistanceOpen && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="text-xs">
              <span className="font-bold text-slate-800">Trip Distance: </span>
              <span className="text-slate-500">Adjust the estimated transit distance manually if known.</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="500"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-24 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 text-slate-900 bg-white"
              />
              <span className="text-xs font-bold text-slate-600">km</span>
            </div>
          </div>
        )}

        {/* Action Button & Preset Chips */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Popular Presets:
              </span>
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleCalculateRoute()}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Route...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Eco Route Options</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Carbon Shaved Hero Card */}
      {routeResult && carbonShaved && recommendedMode && (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Recommended Green Choice: {recommendedMode.name}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {carbonShaved.suggestion}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                By choosing <strong>{recommendedMode.name}</strong> over driving a private car for your{' '}
                <strong>{routeResult.distanceKm} km</strong> commute, you prevent{' '}
                <strong className="text-emerald-400 font-mono">{formatCo2(carbonShaved.co2SavedKg)} kg CO₂e</strong> from entering the atmosphere.
              </p>

              {/* Environmental Equivalence Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs">
                  <TreePine className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Equal to <strong>{carbonShaved.environmentalEquivalents.treesAbsorbedDays} days</strong> of tree CO₂ absorption
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs">
                  <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    Equal to charging <strong>{carbonShaved.environmentalEquivalents.smartphoneCharges} smartphones</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Display Callout */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center min-w-[240px] flex flex-col items-center justify-center shrink-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                Carbon Shaved vs Driving
              </span>
              <div className="flex items-baseline justify-center gap-1 my-2">
                <span className="text-4xl font-black text-white font-mono tracking-tight">
                  -{formatCo2(carbonShaved.co2SavedKg)}
                </span>
                <span className="text-sm font-bold text-emerald-300">kg CO₂e</span>
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                {carbonShaved.percentSaved}% Emission Drop
              </span>

              <div className="w-full mt-4 pt-4 border-t border-white/10 text-[11px] flex justify-between text-slate-300">
                <span>Car: {formatCo2(baseline.co2)} kg</span>
                <span>→</span>
                <span className="font-bold text-emerald-400">
                  {recommendedMode.name}: {formatCo2(recommendedMode.co2)} kg
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Modal Comparison Grid */}
      {routeResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-emerald-600" />
              <span>Side-by-Side Travel Modes Comparison</span>
            </h3>
            <span className="text-xs text-slate-500">
              Distance: <strong className="text-slate-900">{routeResult.distanceKm} km</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {routeResult.modes.map((mode) => {
              const Icon = MODE_ICONS[mode.id] || MODE_ICONS[mode.type] || Car;
              const isBest = mode.isRecommended;
              const isCar = mode.id === 'car';

              return (
                <div
                  key={mode.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 relative ${
                    isBest
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md'
                      : isCar
                      ? 'bg-slate-50/80 border-slate-200/90 text-slate-700'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isBest && (
                    <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Best Green Choice</span>
                    </div>
                  )}

                  <div>
                    {/* Mode Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isBest
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : isCar
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {mode.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {mode.category}
                          </span>
                        </div>
                      </div>

                      {/* Carbon Shaved Pill */}
                      {mode.co2Saved > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          -{formatCo2(mode.co2Saved)} kg
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                      {mode.description}
                    </p>

                    {/* Stats List */}
                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">CO₂ Footprint:</span>
                        <span className={`font-mono font-extrabold text-sm ${isBest ? 'text-emerald-700' : isCar ? 'text-rose-700' : 'text-slate-900'}`}>
                          {formatCo2(mode.co2)} kg
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Emission Factor:</span>
                        <span className="font-mono text-slate-600">
                          {mode.factor.toFixed(2)} kg/km
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Est. Duration:</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          ~{mode.durationMinutes} mins
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Est. Cost:</span>
                        <span className="font-semibold text-slate-700">
                          {mode.estimatedCost}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      disabled={loggingModeId !== null}
                      onClick={() => handleLogTrip(mode)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        isBest
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.02]'
                          : isCar
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {loggingModeId === mode.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{isBest ? 'Choose & Log Eco-Route' : `Log ${mode.name}`}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
