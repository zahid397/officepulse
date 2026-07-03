// frontend/src/utils/powerHelpers.js
// Formatting helpers for power figures.

export function formatWatts(w) {
  if (w == null) return '—';
  if (w >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${w} W`;
}

// Convert watts to an estimated kWh over a given number of hours (demo only)
export function estimateKwh(watts, hours = 1) {
  return ((watts * hours) / 1000).toFixed(3);
}

// Severity → tailwind classes
export const SEVERITY_STYLES = {
  HIGH: {
    badge: 'bg-red-500/15 text-red-300 border border-red-500/40',
    dot: 'bg-red-400',
  },
  MEDIUM: {
    badge: 'bg-orange-500/15 text-orange-300 border border-orange-500/40',
    dot: 'bg-orange-400',
  },
  LOW: {
    badge: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/40',
    dot: 'bg-yellow-400',
  },
};

export function severityStyle(sev) {
  return SEVERITY_STYLES[sev] || SEVERITY_STYLES.LOW;
}
