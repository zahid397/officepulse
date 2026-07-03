// backend/utils/timeUtils.js
// Helpers for office-hours detection and duration formatting.

// Office hours: 9 AM – 5 PM, Monday–Friday, server local time.
const OFFICE_START_HOUR = 9;
const OFFICE_END_HOUR = 17;

function isOfficeHours(date = new Date()) {
  const day = date.getDay(); // 0 Sun … 6 Sat
  const hour = date.getHours();
  const isWeekday = day >= 1 && day <= 5;
  return isWeekday && hour >= OFFICE_START_HOUR && hour < OFFICE_END_HOUR;
}

// Human-readable duration: "2h 15m" / "45m" / "30s"
function formatDuration(ms) {
  if (!ms || ms < 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

// Difference in ms between a past timestamp and now.
function msSince(timestamp) {
  if (!timestamp) return 0;
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return 0;
  return Date.now() - then;
}

module.exports = {
  OFFICE_START_HOUR,
  OFFICE_END_HOUR,
  isOfficeHours,
  formatDuration,
  msSince,
};
