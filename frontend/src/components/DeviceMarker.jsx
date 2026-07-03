import React from 'react';

// Visualises one device on the office floor map.
// Different visual treatments per type/state — see styles/index.css.
// Problem statement v1.2: only fans and lights (no AC).
export default function DeviceMarker({ device, onToggle }) {
  const isOn = device?.status?.toUpperCase() === 'ON';
  const type = device?.device_type;

  // Position is stored as 0-100 percentages for a responsive floor map
  const style = {
    left: `${device.x_position ?? 0}%`,
    top: `${device.y_position ?? 0}%`,
  };

  const markerClass = `marker marker-${type}-${isOn ? 'on' : 'off'}`;

  return (
    <button
      type="button"
      onClick={() => onToggle?.(device)}
      style={style}
      title={`${device.device_name} — ${device.status} — ${device.power_draw}W (click to toggle)`}
      className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
    >
      {/* Visual marker */}
      <div className={`relative w-7 h-7 md:w-9 md:h-9 rounded-full grid place-items-center transition-transform group-hover:scale-110 ${markerClass}`}>
        <span className="text-[10px] md:text-xs">
          {type === 'fan' && <FanGlyph on={isOn} />}
          {type === 'light' && <LightGlyph on={isOn} />}
        </span>
      </div>

      {/* Label on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[9px] md:text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {device.device_name}
      </div>
    </button>
  );
}

function FanGlyph({ on }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={`fan-blade ${on ? 'text-white' : 'text-slate-500'}`}
      fill="currentColor"
    >
      <path d="M12 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-9c3.5 0 6 2 6 5 0 2-2 3.5-4 4-1 .3-1.5.7-2 1.5-.5-.8-1-1.2-2-1.5-2-.5-4-2-4-4 0-3 2.5-5 6-5zm-9 9c3.5 0 5 2.5 5 5 0 .3-.2.7-.3 1 .7.4 1.2.9 1.5 1.7-3.4 0-6.2-2-6.2-5.4 0-1 .3-2 .8-2.6.4.2.8.3 1.2.3zm9 9c-3.5 0-6-2-6-5 0-2 2-3.5 4-4 1-.3 1.5-.7 2-1.5.5.8 1 1.2 2 1.5 2 .5 4 2 4 4 0 3-2.5 5-6 5z" />
    </svg>
  );
}

function LightGlyph({ on }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={on ? 'text-yellow-200' : 'text-slate-500'}
      fill="currentColor"
    >
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
    </svg>
  );
}
