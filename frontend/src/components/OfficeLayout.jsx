import React from 'react';
import DeviceMarker from './DeviceMarker.jsx';

// Renders the office floor map using the x_position / y_position of each device.
// Problem statement v1.2: 3 rooms side by side, 2 fans + 3 lights each.
export default function OfficeLayout({ devices, onToggle }) {
  // Three rooms side by side across the top of the floor map.
  const zones = [
    { name: 'Drawing Room', style: { left: '3%',  top: '8%',  width: '28%', height: '84%' } },
    { name: 'Work Room 1',  style: { left: '35%', top: '8%',  width: '28%', height: '84%' } },
    { name: 'Work Room 2',  style: { left: '67%', top: '8%',  width: '28%', height: '84%' } },
  ];

  return (
    <div className="glass-card p-4 md:p-6 fade-in">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm md:text-base font-semibold tracking-wide text-slate-200 uppercase">
          Office Floor Map · 15 Devices
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <Legend color="bg-cyan-400" label="Fan (60W)" />
          <Legend color="bg-yellow-400" label="Light (15W)" />
        </div>
      </div>

      {/* Aspect-ratio-locked floor map container */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        {/* Room zones */}
        {zones.map((z) => (
          <div key={z.name} className="room-zone" style={z.style}>
            <span className="room-zone-label">{z.name}</span>
          </div>
        ))}

        {/* Device markers */}
        {devices.map((d) => (
          <DeviceMarker key={d.id} device={d} onToggle={onToggle} />
        ))}

        {/* Empty state */}
        {devices.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
            No devices to display
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Tip: click any device marker to manually toggle it on / off. Office max power = 495 W.
      </p>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
