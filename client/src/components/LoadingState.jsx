import React from 'react';
import { Leaf } from 'lucide-react';

export default function LoadingState({ message = 'Loading your footprint...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
          <Leaf className="w-6 h-6" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Connecting to CarbonMap calculation engine...</p>
    </div>
  );
}
