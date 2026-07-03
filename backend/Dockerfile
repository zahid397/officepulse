# backend/Dockerfile
# Minimal production image for the OfficePulse backend.
# Works on Fly.io, Render (Docker runtime), Railway, or any container host.

FROM node:18-slim

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy the rest of the backend source
COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "server.js"]
