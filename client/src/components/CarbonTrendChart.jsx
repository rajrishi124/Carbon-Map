import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatCo2 } from '../utils/formatters';

export default function CarbonTrendChart({ data = [], dailyLimit = 5.5 }) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-800">
          <p className="font-semibold text-slate-200 mb-1">{item.fullDay} ({item.date})</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-bold text-sm">
              {formatCo2(item.co2)} kg CO₂
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {item.activitiesCount} {item.activitiesCount === 1 ? 'activity' : 'activities'} logged
          </p>
        </div>
      );
    }
    return null;
  };

  const totalWeeklyInChart = data.reduce((acc, curr) => acc + (curr.co2 || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Carbon Footprint Trend</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily CO₂ emissions for the current week (Monday — Sunday)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-medium">
            Daily Limit: {formatCo2(dailyLimit)} kg
          </span>
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md font-bold">
            Week: {formatCo2(totalWeeklyInChart)} kg
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No daily data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(val) => `${val} kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={dailyLimit}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: `Limit: ${formatCo2(dailyLimit)} kg`,
                  position: 'top',
                  fill: '#D97706',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="co2"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
                activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
