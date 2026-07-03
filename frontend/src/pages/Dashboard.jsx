import React, { useEffect, useRef, useState, useCallback } from 'react';
import Header from '../components/Header.jsx';
import PowerSummary from '../components/PowerSummary.jsx';
import OfficeLayout from '../components/OfficeLayout.jsx';
import RoomPanel from '../components/RoomPanel.jsx';
import AlertsPanel from '../components/AlertsPanel.jsx';
import { fetchDevices, fetchUsage, fetchAlerts, fetchHealth, toggleDevice } from '../api/apiClient.js';
import { getSocket, subscribe, disconnectSocket } from '../socket/socketClient.js';
import { groupByRoom } from '../utils/deviceHelpers.js';

// Main dashboard page — orchestrates REST + Socket.io updates.
export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [usage, setUsage] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const mounted = useRef(false);

  // ---- Initial REST load ----
  const loadAll = useCallback(async () => {
    try {
      const [d, u, a, h] = await Promise.all([
        fetchDevices(),
        fetchUsage(),
        fetchAlerts(),
        fetchHealth().catch(() => null),
      ]);
      if (!mounted.current) return;
      setDevices(d);
      setUsage(u);
      setAlerts(a);
      setHealth(h);
      setLastUpdate(Date.now());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // ---- Socket.io subscriptions ----
  useEffect(() => {
    mounted.current = true;

    // Initial fetch
    loadAll();

    const socket = getSocket();
    socket.on('connect', () => setLive(true));
    socket.on('disconnect', () => setLive(false));
    socket.on('connect_error', () => setLive(false));

    const offDevices = subscribe('devices:update', (payload) => {
      setDevices(Array.isArray(payload) ? payload : []);
      setLastUpdate(Date.now());
    });
    const offUsage = subscribe('usage:update', (payload) => {
      setUsage(payload);
      setLastUpdate(Date.now());
    });
    const offAlerts = subscribe('alerts:update', (payload) => {
      setAlerts(Array.isArray(payload) ? payload : []);
      setLastUpdate(Date.now());
    });

    return () => {
      mounted.current = false;
      offDevices();
      offUsage();
      offAlerts();
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic health refresh (every 30s) — keeps the API badge in sync
  useEffect(() => {
    const id = setInterval(async () => {
      const h = await fetchHealth().catch(() => null);
      if (h) setHealth(h);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // ---- Manual toggle handler ----
  const handleToggle = useCallback(
    async (device) => {
      if (busyId) return;
      try {
        setBusyId(device.id);
        // Optimistic local update — flip the device immediately for snappy UX,
        // the next socket broadcast will confirm the authoritative state.
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id
              ? { ...d, status: d.status === 'ON' ? 'OFF' : 'ON', last_changed: new Date().toISOString() }
              : d
          )
        );
        await toggleDevice(device.id);
      } catch (err) {
        setError(err.message);
        // Revert on failure
        loadAll();
      } finally {
        setBusyId(null);
      }
    },
    [busyId, loadAll]
  );

  const rooms = groupByRoom(devices);

  return (
    <div className="min-h-screen">
      <Header live={live} health={health} lastUpdate={lastUpdate} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
            <span>
              <strong>Connection issue:</strong> {error}
            </span>
            <button
              onClick={loadAll}
              className="text-xs px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40"
            >
              Retry
            </button>
          </div>
        )}

        {/* KPIs + room bars */}
        <PowerSummary usage={usage} />

        {/* Floor map + alerts side-by-side on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OfficeLayout devices={devices} onToggle={handleToggle} />
          </div>
          <div>
            <AlertsPanel alerts={alerts} />
          </div>
        </div>

        {/* Room panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rooms.map(({ room, devices: devs }) => (
            <RoomPanel
              key={room}
              room={room}
              devices={devs}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-4 pb-8 text-center text-[11px] text-slate-600">
          <p>
            OfficePulse · Smart Office Power Monitoring · Built for hackathon demo
          </p>
          <p className="mt-1">
            Simulator ticks every 15s · {devices.length} devices ·{' '}
            {live ? 'Socket.io connected' : 'Socket.io connecting…'}
          </p>
        </footer>
      </main>
    </div>
  );
}
