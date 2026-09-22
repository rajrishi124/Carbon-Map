import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, RefreshCw, Lightbulb, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { formatCo2 } from '../utils/formatters';

export default function EcoCoach({ refreshTrigger }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvice = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEcoCoach();
      if (res.success) {
        setAdvice(res.data);
      }
    } catch (err) {
      console.warn('EcoCoach error:', err);
      setError('Unable to refresh Eco Coach advice at this moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [refreshTrigger]);

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-2xl p-6 border border-emerald-200/80 shadow-card relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">CarbonMap Eco Coach</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {advice?.poweredBy || 'AI Powered'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personalized reduction intelligence based on your verified MongoDB activity log
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200 transition-colors self-start sm:self-auto"
          title="Re-analyze with current activities"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Analyzing your carbon footprint patterns...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main summary badge */}
          <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-subtle">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {advice?.summary}
            </p>
          </div>

          {/* Actionable insights list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Tailored Carbon Reduction Opportunities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {advice?.insights?.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80 text-xs text-slate-700 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed font-medium">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note & authoritative verification */}
          <div className="pt-3 border-t border-emerald-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Deterministic calculations are authoritative (factors: 0.20 car, 0.08 bus, 0.25 flight, 0.80 electricity, 0.50/2.00 meals).
              </span>
            </div>
            {advice?.potentialWeeklySavingsKg > 0 && (
              <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                Est. Weekly Savings: ~{formatCo2(advice.potentialWeeklySavingsKg)} kg CO₂
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
