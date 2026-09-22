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
  const total = categories.reduce((sum, item) => sum + (item.value || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
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

  const chartData = categories.map((c) => ({
    name: c.name,
    value: c.value,
    color: CATEGORY_COLORS[c.name] || '#94A3B8',
  }));

  const hasData = total > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <PieIcon className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Category Breakdown</h3>
        </div>
        <p className="text-xs text-slate-500">
          Emission distribution across Transport, Electricity, & Food
        </p>
      </div>

      <div className="h-56 my-2 relative">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-2">
              <PieIcon className="w-6 h-6 text-slate-300" />
            </div>
            <span>No emissions logged this week</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-base font-extrabold text-slate-900">
                {formatCo2(total)}
              </span>
              <span className="text-[10px] text-slate-400">kg CO₂</span>
            </div>
          </>
        )}
      </div>

      {/* Legend & Breakdown stats */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        {chartData.map((cat) => {
          const pct = total > 0 ? ((cat.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
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
