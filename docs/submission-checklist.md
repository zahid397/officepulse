# Submission Checklist

Use this checklist the night before the hackathon deadline. Tick every box.

> **Problem statement v1.2:** the office has exactly **15 devices** (3 rooms ×
> 5 devices: 2 fans + 3 lights). No AC units. Max office power = **495 W**.

---

## 📦 Repository

- [ ] GitHub repo is public and named `officepulse`.
- [ ] `README.md` is complete with all required sections.
- [ ] README mentions the **corrected device count: 15 total devices**.
- [ ] `.env` files are NOT committed (only `.env.example`).
- [ ] `.gitignore` includes `node_modules/`, `.env`, `dist/`, `.vercel/`.
- [ ] Repo has a clean commit history (no `update`, `fix`, `asdf` messages).
- [ ] Repo has a short tagline/description on GitHub.

## 🗄️ Supabase

- [ ] Supabase project is created.
- [ ] `supabase/schema.sql` ran successfully (tables + RLS, device_type CHECK
      allows only `fan` and `light`).
- [ ] `supabase/seed.sql` ran successfully — **exactly 15 devices seeded**
      (2 fans + 3 lights per room × 3 rooms).
- [ ] `service_role` key copied into backend secrets — NOT exposed to frontend.
- [ ] Verified by running `SELECT count(*) FROM devices;` → returns **15**.
- [ ] Verified by running `SELECT device_type, count(*) FROM devices GROUP BY
      device_type;` → returns fan=6, light=9 (no AC).

## 🖥️ Backend (Fly.io / Render — see README for why not Replit)

- [ ] Backend deployed to Fly.io (`fly deploy`, using included `Dockerfile` +
      `fly.toml`) or Render (`render.yaml` Blueprint).
- [ ] Secrets/env vars set: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
      `DISCORD_TOKEN` (optional), `PORT`, `FRONTEND_ORIGIN`.
- [ ] Backend URL is public (e.g. `https://officepulse-backend.fly.dev`).
- [ ] `GET /health` returns `{ "status": "ok", ... }`.
- [ ] `GET /api/devices` returns `"count": 15`.
- [ ] `GET /api/usage` returns `"max_possible_watts": 495` and no `acs_on`
      field.
- [ ] Console shows `[simulator] Starting — interval 15000ms`.
- [ ] Console shows `[discord] Bot online as ...` (if token set).
- [ ] If using Render's free tier, a keep-alive pinger (UptimeRobot /
      cron-job.org) is hitting `/health` every 5–10 min before the demo.

## 🎨 Frontend (Vercel / Netlify)

- [ ] Frontend deployed with `VITE_API_BASE_URL` and `VITE_SOCKET_URL` set to
      the backend's public URL.
- [ ] Live URL works (e.g. `https://officepulse.vercel.app`).
- [ ] Dashboard loads devices, usage, and alerts on first paint.
- [ ] Floor map shows **3 rooms side by side** with **15 device markers**
      (no AC markers).
- [ ] Floor map header shows "Office Floor Map · 15 Devices".
- [ ] KPI tile shows "X/15" active devices.
- [ ] Office load bar shows "X W / 495 W (Y%)".
- [ ] Clicking a device marker toggles it and updates the dashboard.
- [ ] Mobile viewport (≤ 480px) is usable.

## 🤖 Discord Bot

- [ ] Bot is invited to a test server.
- [ ] `!status` returns the office summary (15-device total, per-room
      one-liners like "Drawing Room: 1 fan ON, 2 lights ON.").
- [ ] `!room drawing`, `!room work1`, `!room work2` all work.
- [ ] `!usage` returns total power, load %, and insight.
- [ ] `!alerts` returns alerts or "No critical power alerts right now."
- [ ] `!help` lists all commands.
- [ ] Bot does NOT crash on unknown commands.
- [ ] Bot does NOT mention AC devices anywhere.

## 🚨 Alerts

- [ ] Alerts panel populates when devices run too long.
- [ ] Alerts panel populates when devices are ON outside office hours
      (test before 9 AM or after 5 PM, or temporarily tweak `timeUtils.js`).
- [ ] HIGH_USAGE alert fires when a room draws > 120 W (toggle both fans in
      one room ON — that's 120 W, which is at the threshold, so toggle an
      extra light to push past 120 W).

## 📚 Documentation

- [ ] `README.md` complete (overview, problem, **corrected 15-device count**,
      solution, features, stack, architecture, folder structure, Supabase
      setup, deployment guides for Fly.io/Render + Vercel/Netlify, Discord setup, API
      endpoints, demo instructions, env vars, future improvements).
- [ ] `docs/architecture.md` has the diagram with "(15 fans/lights)".
- [ ] `docs/api-documentation.md` documents every endpoint with no AC fields.
- [ ] `docs/discord-bot-commands.md` documents every command with no AC
      references.
- [ ] `docs/demo-script.md` has the 3-minute script (Part 2 mentions 15
      devices / 495 W).
- [ ] `docs/submission-checklist.md` — this file, fully ticked.
- [ ] No file in `docs/`, `README.md`, or `diagrams/` mentions AC devices,
      18 devices, or 250 W threshold.

## 🎥 Demo Video

- [ ] 3-minute demo video recorded (use `docs/demo-script.md`).
- [ ] Video uploaded to YouTube (unlisted is fine) or loom.
- [ ] Video URL is in the README or submission form.

## 🔌 Circuit Schematic (if applicable)

- [ ] If you used real ESP32 hardware: include a Fritzing / hand-drawn
      schematic in `diagrams/`.
- [ ] If simulator-only: include a note in `diagrams/README.md` explaining
      that the simulator stands in for hardware.

## 🛡️ Security

- [ ] No secrets in code or commits (run `git log -p | grep -i key` to verify).
- [ ] No `service_role` key in frontend bundle (search the built `dist/`).
- [ ] CORS is configured to your actual frontend URL (not `*` in production).

## ✅ Final Smoke Test

Run this on the deployed stack the morning of the deadline:

1. Open the frontend URL → dashboard loads, no errors in console.
2. Floor map shows 15 markers across 3 rooms side by side.
3. KPI tile shows "0/15" initially, then updates within 15s.
4. Wait 60 seconds → at least 3 simulator ticks visible.
5. Click a device marker → it toggles, usage number updates.
6. Toggle both fans in one room ON → HIGH_USAGE alert appears in <1s.
7. Open Discord → run `!status` → reply says "X/15" and uses per-room
   one-liners ("Drawing Room: 2 fans ON.").
8. Run `!usage` → reply shows "X W / 495 W (Y% of max)".
9. Run `!alerts` → either real alerts or "No critical power alerts" message.
10. Open `https://<backend>/health` → returns `"status": "ok"`.

If all ten pass — you're ready to submit. 🚀
