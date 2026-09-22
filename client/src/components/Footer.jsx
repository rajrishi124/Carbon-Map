import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 text-xs">
      {/* Top Baseline Status Bar */}
      <div className="border-b border-slate-800/70 bg-slate-900/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">
                  Active Carbon Baselines
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  • Live deterministic real-time tracking
                </span>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold">
              <div className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-200 flex items-center gap-1.5 shadow-xs text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">Daily Limit:</span>
                <span className="font-mono text-emerald-400 font-bold">5.50 kg CO₂e</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700/80 text-slate-200 flex items-center gap-1.5 shadow-xs text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">Weekly Target:</span>
                <span className="font-mono text-amber-400 font-bold">38.50 kg CO₂e</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Monday–Sunday Cycle</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          
          {/* Col 1: Brand & Social Media */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                <Leaf className="w-3 h-3" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Carbon<span className="text-emerald-400">Map</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Personal carbon tracking with official deterministic emission factors.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-2 pt-0.5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Community"
                className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <div className="flex flex-col space-y-1 text-[11px]">
              <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                • Dashboard & Trend
              </Link>
              <Link to="/log-activity" className="text-slate-400 hover:text-emerald-400 transition-colors">
                • Log Carbon Activity
              </Link>
              <Link to="/history" className="text-slate-400 hover:text-emerald-400 transition-colors">
                • Activity History & Filter
              </Link>
            </div>
          </div>

          {/* Col 3: Carbon Baselines Data */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Emission Parameters
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">🚗 Transport:</span>
                <span className="font-mono text-emerald-400">0.04 - 0.25 kg/km</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">⚡ Energy:</span>
                <span className="font-mono text-amber-400">0.80 - 3.00 kg</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">🥗 Meals:</span>
                <span className="font-mono text-teal-400">1.00 vs 2.50 kg</span>
              </div>
            </div>
          </div>

          {/* Col 4: Contact Details */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
              Contact & Support
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <a
                href="mailto:support@carbonmap.org"
                className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">support@carbonmap.org</span>
              </a>
              <a
                href="tel:+18004272666"
                className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>+1 (800) 427-2666</span>
              </a>
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">Climate Lab, Green Tech Hub</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Slim Bottom Bar */}
      <div className="border-t border-slate-900 bg-black/40 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
          <div>
            © {currentYear} CarbonMap • Map your impact. Make better choices.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-500">
              <ShieldCheck className="w-3 h-3" /> Zero-Auth Privacy
            </span>
            <span>•</span>
            <span>MongoDB Atlas</span>
            <span>•</span>
            <span>Deterministic Math</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
