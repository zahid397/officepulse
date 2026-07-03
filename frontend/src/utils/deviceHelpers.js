// frontend/src/utils/deviceHelpers.js
// Pure helpers for grouping / sorting devices on the dashboard.
// Problem statement v1.2: only fans and lights (no AC).

export const DEVICE_ICONS = {
  fan: '🌀',
  light: '💡',
};

export const DEVICE_LABELS = {
  fan: 'Fan',
  light: 'Light',
};

// Group devices by room name, preserving insertion order.
export function groupByRoom(devices) {
  const map = new Map();
  for (const d of devices) {
    if (!map.has(d.room_name)) map.set(d.room_name, []);
    map.get(d.room_name).push(d);
  }
  return Array.from(map.entries()).map(([room, devs]) => ({ room, devices: devs }));
}

// Sort devices within a room: fans first, then lights (stable)
const TYPE_ORDER = { fan: 0, light: 1 };
export function sortDevices(devices) {
  return [...devices].sort((a, b) => {
    const t = (TYPE_ORDER[a.device_type] ?? 99) - (TYPE_ORDER[b.device_type] ?? 99);
    if (t !== 0) return t;
    return a.id.localeCompare(b.id);
  });
}

export function isOn(device) {
  return device?.status?.toUpperCase() === 'ON';
}
