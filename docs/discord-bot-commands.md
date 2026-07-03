# Discord Bot Commands

The OfficePulse Discord bot lives in `backend/discord/bot.js` and uses
`discord.js` v14. It reads from Supabase on every command, so responses always
reflect the latest simulator state.

> **Problem statement v1.2:** the office has exactly **15 devices** (3 rooms ×
> 5 devices: 2 fans + 3 lights). No AC units. Max office power = **495 W**.

## Setup

1. Create a bot at <https://discord.com/developers/applications> and copy the
   token.
2. Enable the **MESSAGE CONTENT INTENT** under *Bot → Privileged Gateway
   Intents*.
3. Invite the bot with the `bot` scope and `Send Messages` + `Read Message
   History` permissions.
4. Set `DISCORD_TOKEN` as an env var/secret on whichever host runs the
   backend (Fly.io: `fly secrets set DISCORD_TOKEN=...`; Render: dashboard
   env vars; local: `backend/.env`).
5. Restart the backend — you should see `[discord] Bot online as ...`.

The bot is **optional**. The backend starts fine without a token (you'll see
`[discord] No DISCORD_TOKEN set — bot disabled` in the logs).

---

## Commands

All commands are prefixed with `!`.

### `!status`

Returns total active devices (out of 15), total current power, fan/light
counts, and a per-room summary.

**Example reply:**
```
🏠 OfficePulse — Status

🔴 Active devices: 4/15
⚡ Total power: 165 W (max 495 W)
🌀 Fans ON: 1  ·  💡 Lights ON: 3

Room-wise summary:
• Drawing Room: 1 fan ON, 2 lights ON.
• Work Room 1: all OFF.
• Work Room 2: 2 fans ON, 3 lights ON.
```

The per-room one-liner adapts to the actual state:
- All OFF → `Drawing Room: all OFF.`
- Only fans → `Drawing Room: 2 fans ON.`
- Only lights → `Work Room 1: 3 lights ON.`
- Both → `Work Room 2: 2 fans ON, 3 lights ON.`

---

### `!room <name>`

Returns the devices and usage for one room. Accepted aliases (case-insensitive):

| Argument            | Room          |
| ------------------- | ------------- |
| `drawing`           | Drawing Room  |
| `work1`             | Work Room 1   |
| `work2`             | Work Room 2   |

You can also pass the full room name (`!room "Drawing Room"`).

**Example:** `!room drawing`

**Reply:**
```
Drawing Room — 1 fan(s) ON, 2 light(s) ON · 75 W

🟢 Drawing Fan 1 (FAN) — ON · 60W
⚫ Drawing Fan 2 (FAN) — OFF · 60W
🟢 Drawing Light 1 (LIGHT) — ON · 15W
🟢 Drawing Light 2 (LIGHT) — ON · 15W
⚫ Drawing Light 3 (LIGHT) — OFF · 15W
```

If you pass an unknown room, the bot replies:
```
❌ No devices found for room "library".
```

---

### `!usage`

Returns total current power, active device count, load percentage vs the 495 W
max, average per active device, and a short energy insight.

**Example reply:**
```
⚡ OfficePulse — Usage

Total current power: 165 W / 495 W (33% of max)
Active devices: 4/15
Average per active device: 41 W

Light load — looks like a break-time footprint. 👍
```

The insight line adapts to the load:
- **0 W** → `Office is fully powered down. Great energy discipline! 💚`
- **< 100 W** → `Light load — looks like a break-time footprint. 👍`
- **< 300 W** → `Moderate load. Keep an eye on devices running past office hours.`
- **≥ 300 W** → `Heavy load. Consider turning off unused fans or lights. ⚡`

---

### `!alerts`

Returns the current alerts, capped at 8 to avoid channel spam. If there are no
alerts, the bot replies with:

```
✅ No critical power alerts right now.
```

**Example reply (when alerts exist):**
```
🚨 OfficePulse — 2 alert(s)

🟠 [OFFICE_HOURS] Drawing Light 1 in Drawing Room is ON outside office hours (9 AM – 5 PM).
🟠 [LONG_RUNNING] Work1 Fan 1 in Work Room 1 has been ON for over 2 hours.
```

Severity badges:
- 🔴 HIGH
- 🟠 MEDIUM
- 🟡 LOW

Alert types:
| type            | trigger                                              |
| --------------- | ---------------------------------------------------- |
| OFFICE_HOURS    | any device ON outside 9 AM–5 PM weekdays             |
| LONG_RUNNING    | any device ON longer than 2 hours (HIGH > 4h)        |
| HIGH_USAGE      | any room drawing > 120 W (HIGH ≥ 150 W)              |

---

### `!help`

Lists all available commands.

```
OfficePulse commands:
!status — total ON devices, total power, room-wise summary
!room drawing | !room work1 | !room work2 — room detail
!usage — current power + active devices + insight
!alerts — current alerts (or "no alerts" message)
```

---

## Resilience

- The bot is wrapped in `try/catch` at every level. If Supabase is unreachable,
  commands reply with a friendly warning instead of crashing.
- Unknown commands are silently ignored (no channel spam).
- Bot errors are logged to the backend console as `[discord] ...`.

## Permissions Needed

- View Channels (read messages)
- Send Messages
- Read Message History

That's it — no admin or moderation permissions required.
