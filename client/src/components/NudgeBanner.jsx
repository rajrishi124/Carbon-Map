import React from 'react';
import { HeartHandshake, Sparkles, Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NudgeBanner({ nudge = null }) {
  if (!nudge || nudge.status !== 'exceeded') {
    return null;
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-elevated border border-emerald-500/30 relative overflow-hidden">
      {/* Background decorative glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Decision Point 1: Supportive Nudge</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{nudge.title || "You're above your weekly carbon target"}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/40">
              +{nudge.diffKg} kg
            </span>
          </h3>

          <p className="text-sm font-medium text-emerald-100/90">
            {nudge.supportiveText || "That's okay — small changes can still make a difference."}
          </p>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-sm text-slate-100 flex items-start gap-3 mt-3">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-emerald-300">Actionable Suggestion: </strong>
              {nudge.suggestion}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3">
          <Link
            to="/log-activity"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            Log Eco Swap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
