import React from 'react';
import DeviceCard from './DeviceCard.jsx';
import { sortDevices } from '../utils/deviceHelpers.js';
import { formatWatts } from '../utils/powerHelpers.js';

// Groups all devices of a single room into a panel with a small usage header.
export default function RoomPanel({ room, devices, onToggle }) {
  const sorted = sortDevices(devices);
  const active = devices.filter((d) => d.status === 'ON').length;
  const watts = devices
    .filter((d) => d.status === 'ON')
    .reduce((s, d) => s + (d.power_draw || 0), 0);

  return (
    <div className="glass-card p-4 md:p-5 fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-semibold text-slate-100">
          {room}
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700 text-slate-300">
            {active}/{devices.length} ON
          </span>
          <span
            className={`px-2 py-1 rounded border ${
              watts > 0
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
          >
            {formatWatts(watts)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sorted.map((d) => (
          <DeviceCard key={d.id} device={d} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
