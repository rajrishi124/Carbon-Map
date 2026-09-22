import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Info, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import ActivityForm from '../components/ActivityForm';
import { ACTIVITY_CONFIG } from '../utils/formatters';

export default function LogActivity() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const handleSuccessToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleActivityAdded = () => {
    // Optional automatic navigation or stay on page
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with back to dashboard */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <ActivityForm
            onActivityAdded={handleActivityAdded}
            onSuccessToast={handleSuccessToast}
          />
        </div>

        {/* Sidebar: Authoritative Factors & Tips */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
            <div className="flex items-center gap-2 mb-3 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Official Emission Factors</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              CarbonMap relies solely on deterministic climate factors specified by the hackathon standard:
            </p>
            <div className="space-y-2">
              {Object.values(ACTIVITY_CONFIG).map((cfg) => (
                <div key={cfg.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-700">{cfg.label}</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {cfg.factor.toFixed(2)} kg / {cfg.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-emerald-700" />
              <span>Decision Point 2: Input Guard</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Unusually extreme entries (e.g. 500,000 km car trip) are strictly intercepted by dual frontend and backend validation to preserve environmental data fidelity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
