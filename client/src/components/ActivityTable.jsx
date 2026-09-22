import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Car,
  Bus,
  Plane,
  Zap,
  Salad,
  Utensils,
  Calendar,
  FileText,
} from 'lucide-react';
import { formatDate, formatCo2, getActivityMeta } from '../utils/formatters';

const TYPE_ICONS = {
  car: Car,
  bus: Bus,
  flight: Plane,
  electricity: Zap,
  veg_meal: Salad,
  non_veg_meal: Utensils,
};

export default function ActivityTable({ activities = [], onDeleteActivity, isDeletingId }) {
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    activity: null,
  });

  const handleConfirmDelete = async () => {
    if (deleteModal.activity && onDeleteActivity) {
      await onDeleteActivity(deleteModal.activity._id);
    }
    setDeleteModal({ isOpen: false, activity: null });
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Activity</th>
              <th className="py-3.5 px-4">Quantity</th>
              <th className="py-3.5 px-4">Unit</th>
              <th className="py-3.5 px-4">Emission Factor</th>
              <th className="py-3.5 px-4">CO₂ Footprint</th>
              <th className="py-3.5 px-4">Note</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {activities.map((item) => {
              const meta = getActivityMeta(item.type);
              const Icon = TYPE_ICONS[item.type] || Car;
              return (
                <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                    {formatDate(item.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800">{meta.label}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {item.unit}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {item.emissionFactor?.toFixed(2)} kg/{item.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                      {formatCo2(item.co2)} kg
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {item.note || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, activity: item })}
                      disabled={isDeletingId === item._id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {activities.map((item) => {
          const meta = getActivityMeta(item.type);
          const Icon = TYPE_ICONS[item.type] || Car;
          return (
            <div
              key={item._id}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{meta.label}</h4>
                    <p className="text-[11px] text-slate-400">{formatDate(item.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteModal({ isOpen: true, activity: item })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-600">
                  {item.quantity} {item.unit}
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatCo2(item.co2)} kg CO₂
                </span>
              </div>

              {item.note && (
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                  "{item.note}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal (Requirement Section 31) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delete this activity?</h3>
                <p className="text-xs text-slate-500">This action will immediately update your footprint totals.</p>
              </div>
            </div>

            {deleteModal.activity && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-semibold text-slate-800">
                  {getActivityMeta(deleteModal.activity.type).label} — {deleteModal.activity.quantity} {deleteModal.activity.unit}
                </p>
                <p className="text-slate-500">
                  CO₂ impact: <strong>{formatCo2(deleteModal.activity.co2)} kg</strong>
                </p>
                <p className="text-slate-400">{formatDate(deleteModal.activity.date)}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, activity: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
