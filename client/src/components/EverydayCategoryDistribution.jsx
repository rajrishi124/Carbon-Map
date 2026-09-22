import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers, Calendar, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { formatCo2, toLocalDateStr } from '../utils/formatters';

const CATEGORY_COLORS = {
  Transport: '#10B981',   // Emerald
  Electricity: '#F59E0B', // Amber
  Food: '#064E3B',        // Forest Green
};

export default function EverydayCategoryDistribution({ trendData = [], dailyLimit = 5.5 }) {
  const [activeDay, setActiveDay] = useState(null);

  const todayDateStr = toLocalDateStr(new Date());

  const CustomTooltip = ({ active, payload, dayTotal }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = dayTotal > 0 ? ((data.value / dayTotal) * 100).toFixed(0) : 0;
      return (
        <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] border border-slate-800 z-50 pointer-events-none">
          <p className="font-semibold text-slate-200">{data.name}</p>
          <p className="text-emerald-400 font-bold">
            {formatCo2(data.value)} kg ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Everyday Category Distribution
            </h3>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Monday — Sunday (7 Days)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily emission breakdown across Transport, Electricity, & Food compared against your {formatCo2(dailyLimit)} kg CO₂e daily limit.
          </p>
        </div>

        {/* Global Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="font-medium text-slate-600">Transport</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="font-medium text-slate-600">Electricity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#064E3B]" />
            <span className="font-medium text-slate-600">Food</span>
          </div>
        </div>
      </div>

      {/* 7-Day Grid of Daily Donut Pie Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3.5">
        {trendData.map((d) => {
          const isToday = d.date === todayDateStr;
          const isOverLimit = d.co2 > dailyLimit;
          const dayCo2 = Number(d.co2 || 0);

          const transportVal = Number(d.categories?.Transport || 0);
          const electricityVal = Number(d.categories?.Electricity || 0);
          const foodVal = Number(d.categories?.Food || 0);

          const dayChartData = [
            { name: 'Transport', value: transportVal, color: CATEGORY_COLORS.Transport },
            { name: 'Electricity', value: electricityVal, color: CATEGORY_COLORS.Electricity },
            { name: 'Food', value: foodVal, color: CATEGORY_COLORS.Food },
          ].filter((c) => c.value > 0);

          const hasData = dayCo2 > 0;
          const formattedDate = d.date
            ? new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '';

          return (
            <div
              key={d.day}
              onMouseEnter={() => setActiveDay(d.day)}
              onMouseLeave={() => setActiveDay(null)}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                isToday
                  ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900">{d.day}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {formattedDate}
                  </span>
                </div>

                {/* Over / Under Badge */}
                {hasData ? (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isOverLimit
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                    title={isOverLimit ? `Exceeded 5.5 kg limit` : `Under 5.5 kg limit`}
                  >
                    {isOverLimit ? 'Over' : 'OK'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400">
                    None
                  </span>
                )}
              </div>

              {/* Donut Pie Chart Container */}
              <div className="h-28 my-1 relative flex items-center justify-center">
                {!hasData ? (
                  <div className="w-18 h-18 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-400 font-semibold">0.00</span>
                    <span className="text-[8px] text-slate-300">kg CO₂</span>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip dayTotal={dayCo2} />} />
                        <Pie
                          data={dayChartData}
                          innerRadius={30}
                          outerRadius={44}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {dayChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center text showing Day's Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs font-black text-slate-900 tracking-tight leading-none">
                        {formatCo2(dayCo2)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                        kg
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Day Breakdown Sub-bars / Stats */}
              <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                {hasData ? (
                  <>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Car/Bus
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCo2(transportVal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                        Energy
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCo2(electricityVal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#064E3B]" />
                        Food
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatCo2(foodVal)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center py-2 italic">
                    No activities
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
