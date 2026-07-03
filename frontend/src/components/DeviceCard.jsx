import React from 'react';
import { DEVICE_ICONS, DEVICE_LABELS, isOn } from '../utils/deviceHelpers.js';
import { formatWatts } from '../utils/powerHelpers.js';

// A single device row card. Click toggles its state.
export default function DeviceCard({ device, onToggle, busy }) {
  const on = isOn(device);
  return (
    <button
      type="button"
      onClick={() => onToggle?.(device)}
      disabled={busy}
      className={`w-full text-left glass-card p-3 md:p-4 flex items-center gap-3 transition-all hover:scale-[1.02] ${
        on ? 'ring-1 ring-green-500/40' : 'opacity-80'
      } ${busy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
    >
      <div
        className={`w-10 h-10 rounded-lg grid place-items-center text-xl shrink-0 ${
          on
            ? 'bg-green-500/10 border border-green-500/40'
            : 'bg-slate-800 border border-slate-700'
        }`}
      >
        {DEVICE_ICONS[device.device_type] || '🔌'}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-100 truncate">
          {device.device_name}
        </p>
        <p className="text-[11px] text-slate-400 uppercase tracking-wide">
          {DEVICE_LABELS[device.device_type] || device.device_type} · {formatWatts(device.power_draw)}
        </p>
      </div>

      <div className="text-right shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            on
              ? 'bg-green-500/15 text-green-300 border border-green-500/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              on ? 'bg-green-400 animate-pulse-soft' : 'bg-slate-500'
            }`}
          />
          {device.status}
        </span>
      </div>
    </button>
  );
}
