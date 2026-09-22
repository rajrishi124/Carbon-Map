import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCo2 } from '../utils/formatters';

const CATEGORY_COLORS = {
  Transport: '#10B981',   // Emerald
  Electricity: '#F59E0B', // Amber
  Food: '#064E3B',        // Forest Green
};

export default function CategoryChart({ categories = [] }) {
  const activeCategories = categories.map((c) => ({
    name: c.name,
    value: c.value || 0,
    color: CATEGORY_COLORS[c.name] || c.color || '#94A3B8',
  }));

  const dayTotal = activeCategories.reduce((sum, item) => sum + (item.value || 0), 0);
  const hasData = dayTotal > 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = dayTotal > 0 ? ((data.value / dayTotal) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs border border-slate-800">
          <p className="font-semibold text-slate-200">{data.name}</p>
          <p className="text-emerald-400 font-bold text-sm mt-0.5">
            {formatCo2(data.value)} kg CO₂ ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Category Breakdown</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Emission distribution across Transport, Electricity, & Food
            </p>
          </div>
        </div>
      </div>

      <div className="h-56 my-2 relative">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-2">
              <PieIcon className="w-6 h-6 text-slate-300" />
            </div>
            <span className="font-semibold text-slate-600">
              No emissions logged this week
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              0.00 kg CO₂ recorded
            </span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={activeCategories.filter(c => c.value > 0)}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {activeCategories.filter(c => c.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total
              </span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                {formatCo2(dayTotal)}
              </span>
              <span className="text-[10px] font-medium text-slate-400">kg CO₂</span>
            </div>
          </>
        )}
      </div>

      {/* Legend & Breakdown stats */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        {activeCategories.map((cat) => {
          const pct = dayTotal > 0 ? ((cat.value / dayTotal) * 100).toFixed(0) : 0;
          return (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-medium">{pct}%</span>
                <span className="font-semibold text-slate-900 w-16 text-right">
                  {formatCo2(cat.value)} kg
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
