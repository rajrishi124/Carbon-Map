import React from 'react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit = 'kg',
  supportingText,
  badgeText,
  variant = 'default',
  onClick,
}) {
  const variantStyles = {
    default: {
      border: 'border-slate-200/80',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      badge: 'bg-slate-100 text-slate-700',
    },
    accent: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    warning: {
      border: 'border-amber-200',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-100',
      badge: 'bg-amber-100 text-amber-800',
    },
    danger: {
      border: 'border-rose-200',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-100',
      badge: 'bg-rose-100 text-rose-800',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-2xl p-6 border ${style.border} shadow-card hover:shadow-elevated transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-emerald-400' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${style.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
        {badgeText && (
          <span className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${style.badge}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          <span className="text-sm font-semibold text-slate-500">{unit}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          {supportingText}
        </p>
      </div>
    </div>
  );
}
