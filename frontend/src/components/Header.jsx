import React from 'react';

// Top app header — shows project name, live status, current time, backend health.
export default function Header({ live, health, lastUpdate }) {
  const time = new Date().toLocaleTimeString();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-op-bg/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/30 to-green-500/30 grid place-items-center border border-cyan-400/30">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              Office<span className="text-op-accent">Pulse</span>
            </h1>
            <p className="text-[11px] text-slate-400 -mt-0.5">
              Smart Office Power Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700">
            <span className={`live-dot ${live ? '' : 'opacity-30'}`} />
            <span className="text-slate-300 font-medium">
              {live ? 'Live' : 'Connecting…'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700">
            <span className="text-slate-500">API</span>
            <span
              className={`font-mono ${
                health?.status === 'ok' ? 'text-green-400' : 'text-slate-400'
              }`}
            >
              {health?.status || '—'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700">
            <span className="text-slate-500">Updated</span>
            <span className="font-mono text-slate-300">
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : time}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
