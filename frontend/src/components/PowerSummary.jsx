import React from 'react';
import { formatWatts, estimateKwh } from '../utils/powerHelpers.js';

// KPI tiles + room-wise usage bars.
// Problem statement v1.2: 15 devices, max 495 W office-wide, no AC.
export default function PowerSummary({ usage }) {
  if (!usage) {
    return (
      <div className="glass-card p-5 text-slate-400 text-sm">
        Loading usage…
      </div>
    );
  }

  const total = usage.total_devices || 0;
  const active = usage.active_devices || 0;
  const watts = usage.total_watts || 0;
  const maxWatts = usage.max_possible_watts || 495;
  const loadPercent = usage.load_percent || 0;
  const rooms = usage.rooms || {};
  const maxRoomWatts = Math.max(1, ...Object.values(rooms).map((r) => r.watts || 0));

  return (
    <div className="space-y-4">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Active Devices"
          value={`${active}/${total}`}
          accent="text-green-300"
          sub={`${usage.inactive_devices ?? 0} idle`}
        />
        <KpiTile
          label="Current Power"
          value={formatWatts(watts)}
          accent="text-cyan-300"
          sub={`${loadPercent}% of ${formatWatts(maxWatts)} max`}
        />
        <KpiTile
          label="Est. Energy / hr"
          value={`${estimateKwh(watts, 1)} kWh`}
          accent="text-sky-300"
          sub={`≈ ${(watts * 24 / 1000).toFixed(2)} kWh/day`}
        />
        <KpiTile
          label="Fans / Lights ON"
          value={`${usage.fans_on ?? 0} / ${usage.lights_on ?? 0}`}
          accent="text-yellow-300"
          sub="by type"
        />
      </div>

      {/* Office-wide load bar */}
      <div className="glass-card p-4 md:p-5 fade-in">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-semibold uppercase tracking-wide">
            Office Load
          </span>
          <span className="font-mono text-slate-400">
            {formatWatts(watts)} / {formatWatts(maxWatts)} ({loadPercent}%)
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-yellow-400 transition-all duration-500"
            style={{ width: `${Math.min(100, loadPercent)}%` }}
          />
        </div>
      </div>

      {/* Room-wise bars */}
      <div className="glass-card p-4 md:p-5 fade-in">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide mb-3">
          Room-wise Power Usage
        </h3>
        <div className="space-y-3">
          {Object.entries(rooms).map(([room, stats]) => (
            <div key={room}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{room}</span>
                <span className="font-mono text-slate-400">
                  {stats.active}/{stats.total} active · {formatWatts(stats.watts)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-500"
                  style={{ width: `${((stats.watts || 0) / maxRoomWatts) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {Object.keys(rooms).length === 0 && (
            <p className="text-slate-500 text-sm">No rooms to display yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, accent }) {
  return (
    <div className="glass-card p-4 fade-in">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </p>
      <p className={`text-xl md:text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{sub}</p>}
    </div>
  );
}
