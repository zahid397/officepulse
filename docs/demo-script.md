# OfficePulse — 3-Minute Demo Script

This script is paced for a **3-minute** hackathon demo video. Each part has a
target duration and the exact narration / on-screen actions.

Total target length: **3:00**.

> **Problem statement v1.2:** the office has exactly **15 devices** (3 rooms ×
> 5 devices: 2 fans + 3 lights). No AC units. Max office power = **495 W**.

---

## Part 1 — Problem intro (0:00 – 0:20)

**Narration:**
> "Every office wastes electricity because no one can see which devices are
> running and for how long. Lights left on overnight, fans spinning for hours
> with nobody around — that's real money, real carbon, and zero visibility.
>
> OfficePulse fixes this. It's a real-time power monitoring system that tracks
> every fan and light in the office, alerts you when something is wasteful, and
> lets you check the whole office from Discord."

**On screen:** title card with the OfficePulse logo + tagline. Slow fade-in
to the dashboard.

---

## Part 2 — Correct office setup (0:20 – 0:40)

**Narration:**
> "Here's the office: three rooms side by side — Drawing Room, Work Room 1,
> Work Room 2. Each room has two fans and three lights, fifteen devices in
> total. Each fan draws sixty watts, each light draws fifteen. So the maximum
> the whole office can draw is four hundred and ninety-five watts. That's the
> budget we're monitoring against."

**On screen:**
- Show the floor map with all three rooms visible.
- Hover over each room label.
- Point at the legend: "Fan (60W) · Light (15W)".

---

## Part 3 — Dashboard live monitoring (0:40 – 1:05)

**Narration:**
> "The top KPIs show total active devices out of fifteen, current power, load
> percentage against the four ninety-five watt max, and how many fans and lights
> are on. Below that is the office-wide load bar, and below that, each room
> shows its own usage bar so I can see at a glance which room is pulling the
> most power."

**On screen:**
- Slow pan across the KPI tiles.
- Hover over the office-wide load bar.
- Hover over each room's usage bar.
- Point at the live indicator (pulsing green dot).

---

## Part 4 — Simulator changes devices automatically (1:05 – 1:35)

**Narration:**
> "Every fifteen seconds, the backend simulator randomly toggles one to three
> devices, persists the change to Supabase, and pushes the update to the
> dashboard over Socket.io — no refresh needed. Watch this fan: it spins when
> ON, grays out when OFF. Lights glow yellow when ON. The whole UI updates in
> real time."

**On screen:**
- Wait for a simulator tick (should happen within 15 seconds).
- Point at a fan as it starts/stops spinning.
- Point at a light as it glows / dims.

---

## Part 5 — Alerts appear (1:35 – 2:00)

**Narration:**
> "The alerts panel on the right is where the magic happens. OfficePulse
> automatically flags three things: devices running outside office hours,
> devices on for more than two hours, and rooms drawing too much power at
> once. Right now I can see alerts — orange for medium severity, red for
> high. Each one tells me exactly which device, which room, and why."

**On screen:**
- Zoom in on the alerts panel.
- Hover over an alert to show the full message.
- If no live alerts, manually toggle both fans in one room ON to trigger a
  HIGH_USAGE alert (> 120 W in one room).

---

## Part 6 — Discord bot commands (2:00 – 2:25)

**Narration:**
> "Admins don't need to open the dashboard — they can ask the Discord bot.
> Type `!status` for the whole office summary, broken down per room. `!room
> drawing` for one room. `!usage` for total energy plus a smart insight.
> `!alerts` for the active alert list. The bot reads live from Supabase, so
> it always reflects what's happening right now."

**On screen:**
- Switch to Discord window.
- Type and send each command in turn.
- Show the bot's reply for each.

---

## Part 7 — Architecture explanation (2:25 – 2:50)

**Narration:**
> "Quick architecture: fifteen simulated devices feed the backend simulator,
> which writes to Supabase and the in-memory store together. The Express API
> and Socket.io server read from that same store and push updates to the web
> dashboard. The Discord bot reads from the identical store — that's the
> single source of truth the architecture requires. The whole stack is
> React, Vite, Tailwind on the frontend; Node, Express, Socket.io, Discord.js
> on the backend; Supabase Postgres for storage. Frontend deploys to Vercel,
> backend to Fly.io because it needs to stay alive twenty-four-seven for the
> simulator and bot."

**On screen:**
- Show the architecture diagram (from `docs/architecture.md`).
- Highlight each box as it's mentioned.

---

## Part 8 — Future improvements (2:50 – 3:00)

**Narration:**
> "What's next: replace the simulator with real ESP32 relays, add AC units in a
> future iteration, add historical energy charts, schedule-based auto-shutoff
> rules, and Slack or Teams support. Thanks for watching — OfficePulse, smart
> power monitoring for every office."

**On screen:**
- Final card with project name, GitHub URL, team name.
- Hold for 3 seconds, fade to black.

---

## Recording Tips

- Record at 1080p / 30 fps minimum.
- Use OBS or Loom; pre-warm the dashboard before hitting record so the first
  simulator tick is visible within the first 90 seconds.
- If you can, schedule the recording at a non-office hour (before 9 AM or
  after 5 PM local time) so the OFFICE_HOURS alert naturally fires.
- Keep a Discord test channel open in another window — that way you don't have
  to switch contexts mid-demo.
- Have a backup: pre-toggle both fans in one room ON before recording so the
  HIGH_USAGE alert is guaranteed to appear even if the simulator is slow.
