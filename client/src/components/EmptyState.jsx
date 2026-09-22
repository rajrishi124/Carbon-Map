import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, PlusCircle, Database, Sparkles } from 'lucide-react';

export default function EmptyState({ onLoadDemoData, isLoadingDemo = false }) {
  return (
    <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200/80 shadow-card text-center max-w-2xl mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
        <Leaf className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        No activities yet
      </h3>

      <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
        Start tracking your daily choices to see your carbon footprint, or quickly load realistic demo data to explore the full dashboard.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/log-activity"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Your First Activity</span>
        </Link>

        {onLoadDemoData && (
          <button
            onClick={onLoadDemoData}
            disabled={isLoadingDemo}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all disabled:opacity-50"
          >
            {isLoadingDemo ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                <span>Loading Demo...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Load Demo Data</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1">
        <Sparkles className="w-3 h-3 text-emerald-500" />
        Pre-populates car, bus, power, and meal logs across this week
      </p>
    </div>
  );
}
