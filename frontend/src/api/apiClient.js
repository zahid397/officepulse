// frontend/src/api/apiClient.js
// Centralised Axios instance for the OfficePulse backend.
// Reads base URL from Vite env (VITE_API_BASE_URL).

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Friendly error wrapper so UI components don't have to repeat try/catch parsing
function wrapError(err, fallback) {
  const msg =
    err?.response?.data?.error ||
    err?.message ||
    fallback ||
    'Unknown API error';
  return new Error(msg);
}

export async function fetchDevices() {
  try {
    const { data } = await apiClient.get('/api/devices');
    return data.devices || [];
  } catch (err) {
    throw wrapError(err, 'Failed to fetch devices');
  }
}

export async function fetchUsage() {
  try {
    const { data } = await apiClient.get('/api/usage');
    return data;
  } catch (err) {
    throw wrapError(err, 'Failed to fetch usage');
  }
}

export async function fetchAlerts() {
  try {
    const { data } = await apiClient.get('/api/alerts');
    return data.alerts || [];
  } catch (err) {
    throw wrapError(err, 'Failed to fetch alerts');
  }
}

export async function toggleDevice(deviceId) {
  try {
    const { data } = await apiClient.patch(`/api/devices/${deviceId}/toggle`);
    return data.device;
  } catch (err) {
    throw wrapError(err, 'Failed to toggle device');
  }
}

export async function fetchHealth() {
  try {
    const { data } = await apiClient.get('/health');
    return data;
  } catch (err) {
    throw wrapError(err, 'Health check failed');
  }
}

export default apiClient;
