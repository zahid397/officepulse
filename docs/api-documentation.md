# API Documentation

Base URL: `http://localhost:5000` (local) or `https://officepulse-backend.fly.dev` (deployed — Fly.io or Render, see README).

> **Problem statement v1.2:** the office has exactly **15 devices** (3 rooms ×
> 5 devices each: 2 fans + 3 lights). No AC units. Max office power = **495 W**.

---

## GET `/health`

Returns backend health and configuration status. Safe to call without auth.

### Example Response
```json
{
  "status": "ok",
  "service": "officepulse-backend",
  "time": "2026-07-03T10:00:00.000Z",
  "supabase": "configured",
  "discord": "configured",
  "simulator": "running"
}
```

---

## GET `/api/devices`

Returns all 15 devices, ordered by room then id.

### Example Response
```json
{
  "source": "supabase",
  "count": 15,
  "devices": [
    {
      "id": "drawing-fan-1",
      "room_name": "Drawing Room",
      "device_name": "Drawing Fan 1",
      "device_type": "fan",
      "status": "ON",
      "power_draw": 60,
      "last_changed": "2026-07-03T09:58:12.000Z",
      "x_position": 10,
      "y_position": 22,
      "created_at": "2026-07-03T09:00:00.000Z"
    }
  ]
}
```

The `source` field is `"supabase"` when data was loaded from the DB, or
`"memory"` / `"memory-fallback"` when the backend served the local seed.

---

## GET `/api/devices/:id`

Returns a single device by id.

### Example Response
```json
{
  "device": {
    "id": "drawing-fan-1",
    "room_name": "Drawing Room",
    "device_name": "Drawing Fan 1",
    "device_type": "fan",
    "status": "ON",
    "power_draw": 60,
    "last_changed": "2026-07-03T09:58:12.000Z",
    "x_position": 10,
    "y_position": 22,
    "created_at": "2026-07-03T09:00:00.000Z"
  }
}
```

### 404 Response
```json
{ "error": "Device not found" }
```

---

## PATCH `/api/devices/:id/toggle`

Toggles the device between `ON` and `OFF`. Persists to Supabase, records an
event, and broadcasts the new state over Socket.io.

### Example Response
```json
{
  "device": {
    "id": "drawing-fan-1",
    "room_name": "Drawing Room",
    "device_name": "Drawing Fan 1",
    "device_type": "fan",
    "status": "OFF",
    "power_draw": 60,
    "last_changed": "2026-07-03T10:01:33.000Z",
    "x_position": 10,
    "y_position": 22,
    "created_at": "2026-07-03T09:00:00.000Z"
  }
}
```

---

## GET `/api/usage`

Returns total and room-wise usage stats computed from the live device list.

### Example Response
```json
{
  "total_devices": 15,
  "active_devices": 4,
  "inactive_devices": 11,
  "total_watts": 165,
  "max_possible_watts": 495,
  "load_percent": 33,
  "avg_watts_per_active": 41,
  "fans_on": 1,
  "lights_on": 3,
  "rooms": {
    "Drawing Room": { "total": 5, "active": 2, "watts": 75 },
    "Work Room 1":  { "total": 5, "active": 1, "watts": 60 },
    "Work Room 2":  { "total": 5, "active": 1, "watts": 30 }
  }
}
```

Note: there is no `acs_on` field — the office has no AC units.

---

## GET `/api/alerts`

Returns the current alert list, sorted by severity (HIGH → MEDIUM → LOW).

### Example Response
```json
{
  "count": 2,
  "alerts": [
    {
      "type": "OFFICE_HOURS",
      "severity": "MEDIUM",
      "message": "Drawing Light 1 in Drawing Room is ON outside office hours (9 AM – 5 PM).",
      "deviceId": "drawing-light-1",
      "deviceName": "Drawing Light 1",
      "roomName": "Drawing Room",
      "watts": 15
    },
    {
      "type": "LONG_RUNNING",
      "severity": "MEDIUM",
      "message": "Work1 Fan 1 in Work Room 1 has been ON for over 2 hours.",
      "deviceId": "work1-fan-1",
      "deviceName": "Work1 Fan 1",
      "roomName": "Work Room 1",
      "watts": 60,
      "runtimeMs": 7200000
    }
  ]
}
```

### Alert Types
| type            | severity range | trigger                                          |
| --------------- | -------------- | ------------------------------------------------ |
| OFFICE_HOURS    | MEDIUM         | any device ON outside 9 AM–5 PM weekdays         |
| LONG_RUNNING    | MEDIUM / HIGH  | any device ON longer than 2 hours (HIGH > 4h)    |
| HIGH_USAGE      | LOW / HIGH     | any room drawing > 120 W (HIGH ≥ 150 W)          |

---

## GET `/api/rooms/:roomName`

Returns devices and usage for a single room. The room name is matched
case-insensitively, ignoring spaces (e.g. `work1`, `Work%20Room%201` both work).

### Example Request
```
GET /api/rooms/drawing
```

### Example Response
```json
{
  "room_name": "Drawing Room",
  "devices": [
    {
      "id": "drawing-fan-1",
      "device_name": "Drawing Fan 1",
      "device_type": "fan",
      "status": "ON",
      "power_draw": 60,
      "x_position": 10,
      "y_position": 22
    }
  ],
  "usage": {
    "total_devices": 5,
    "active_devices": 2,
    "inactive_devices": 3,
    "total_watts": 75,
    "max_possible_watts": 495,
    "load_percent": 15,
    "fans_on": 1,
    "lights_on": 1
  }
}
```

### 404 Response
```json
{ "error": "Room \"invalid\" not found" }
```

---

## Socket.io Events

The backend emits the following events to all connected clients. The frontend
subscribes via `frontend/src/socket/socketClient.js`.

| Event             | Payload                                    |
| ----------------- | ------------------------------------------ |
| `devices:update`  | array of 15 device objects (full list)     |
| `usage:update`    | usage object (same shape as `/api/usage`)  |
| `alerts:update`   | array of alert objects                     |

Clients may also send `ping` and will receive a `pong` with `{ t: <timestamp> }`.

---

## Error Handling

All endpoints return JSON. Errors use this shape:

```json
{
  "error": "Failed to fetch devices",
  "detail": "connect ECONNREFUSED 127.0.0.1:5432"
}
```

The `detail` field is omitted on 404s and on endpoints that fall back to the
in-memory seed (those return 200 with `source: "memory-fallback"`).
