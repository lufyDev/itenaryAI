# ItineraryAI — Express API (auth, trips, survey, SSE proxy to the agent)
#
# Note: package-lock.json is currently gitignored, so `npm ci` would fail
# on a fresh clone. Using `npm install --omit=dev` to stay buildable either
# way — see DEPLOY.md for why the lockfile should be committed.

FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Cloud Run / Fly inject PORT. 8080 stays the local default.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
