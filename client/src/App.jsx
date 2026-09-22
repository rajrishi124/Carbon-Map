import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogActivity from './pages/LogActivity';
import History from './pages/History';
import { Leaf, Heart, Shield } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {/* Top Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log-activity" element={<LogActivity />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer (Section 4 & 35) */}
        <footer className="border-t border-slate-200/80 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900">CarbonMap</span>
              <span className="text-slate-300">|</span>
              <span>Map your impact. Make better choices.</span>
            </div>

            <p className="text-center md:text-right text-slate-400">
              Track everyday activities, understand your carbon footprint, and discover practical ways to reduce your impact.
            </p>

            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <Shield className="w-3 h-3 text-emerald-600" />
                Zero Auth Required
              </span>
              <span>Mon-Sun Cycle</span>
              <span>Hackathon Edition</span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
