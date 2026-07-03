import React from 'react';
import { severityStyle } from '../utils/powerHelpers.js';

// Live alerts panel. Color-coded by severity.
export default function AlertsPanel({ alerts }) {
  const list = alerts || [];
  return (
    <div className="glass-card p-4 md:p-5 fade-in h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
          Alerts
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            list.length === 0
              ? 'bg-green-500/15 text-green-300 border border-green-500/30'
              : 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
          }`}
        >
          {list.length} active
        </span>
      </div>

      {list.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-sm">
          <p className="text-2xl mb-2">✅</p>
          <p>No critical power alerts right now.</p>
          <p className="text-[11px] text-slate-600 mt-1">
            Alerts will appear here automatically as the simulator runs.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {list.map((a, idx) => {
            const s = severityStyle(a.severity);
            return (
              <div
                key={`${a.deviceId || a.roomName}-${idx}`}
                className={`p-3 rounded-lg border ${s.badge} text-xs animate-slide-in`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1 inline-block w-2 h-2 rounded-full ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider opacity-80">
                        {a.type}
                      </span>
                      <span className="font-mono text-[10px] opacity-70">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-100 leading-snug">{a.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
