# Deploying ItineraryAI

Three pieces plus a database:

| Piece | Where | Why |
|---|---|---|
| Next frontend | Vercel Hobby, `itineraryai.in` | Always up, instant, free |
| Express API (this repo root) | Railway, public domain | Holds a 180s SSE stream, longer than a Vercel Hobby function allows |
| FastAPI agent (`itenary_ai` repo) | Railway, private network only | 400MB of deps, needs a writable filesystem |
| MongoDB | Atlas M0, `Cluster0` in Mumbai | Free tier, no expiry |

Target cost: **about $5/month** (Railway Hobby, which includes $5 of usage),
plus domain renewal. This assumes the agent sleeps when idle; if it never
sleeps, expect a few dollars more.

## Why Railway

- **The agent gets no public URL.** It has no auth of its own, so anyone who
  could reach it could skip Express's rate limiter and spend OpenAI and Tavily
  money. On Railway only Express can reach it, with no code change.
- **The Chroma cache survives.** A volume keeps it across restarts and
  redeploys.
- **Both repos already have Dockerfiles**, so Railway builds them as they are.

Cloud Run was the earlier plan and is cheaper (about $0), but it needs IAM and
ID tokens in Express to lock down the agent, and it has no volume-style cache.

## Why the API is not folded into Next

`POST /api/trips/:tripId/generate-stream` opens an SSE response and proxies
the Python stream (`routes/tripRoutes.js`). Vercel Hobby caps function duration
well below that, so moving this route to Next would mean restructuring it into
enqueue-and-poll. The other routes would move fine; this one is the blocker.
Revisit if the generation ever gets split into a job queue.

## Order of operations

### 0. Merge the deploy branch

The Dockerfiles, CORS allowlist, rate limiter and demo trip link are only on
`deploy/cloud-run-prep`. Merge it to `main` in both repos and deploy `main`, so
Vercel and Railway build the same code. The branch name is left over from the
Cloud Run plan; none of its code depends on Cloud Run.

### 1. MongoDB Atlas

`Cluster0` already exists, and your real data is in it.

- **Keep `MONGO_URI` pointing at the `test` database.** The URI in `.env` has
  no database name, so Mongoose defaults to `test`, which holds the 20 trips
  and 5 users. `itenaryDB` only has 1 trip, so adding `/itenaryDB` to the URI
  would make that data look lost.
- **Allow `0.0.0.0/0` under Network Access.** Railway only offers static
  outbound IPs on the Pro plan. Without this the API exits on startup, because
  `config/db.js` calls `process.exit(1)` when it can't connect.

### 2. Create the Railway project

Create one project and put both services in it. Services in different projects
can't use each other's private network. Pick the region closest to Mumbai,
which is where Atlas is.

Upgrade to Hobby. The trial is a one-time $5 credit, and the Free plan caps
services at 0.5 GB, which is too small for the agent.

### 3. Deploy the agent

See `DEPLOY.md` in the `itenary_ai` repo. `AI_SERVICE_URL` below refers to it by
service name, so name the service `itineraryai-agent`.

### 4. Deploy this API

New service from the `lufyDev/itenaryAI` repo. Railway finds the Dockerfile at
the repo root. The `frontend/` folder is excluded by `.dockerignore`.

Variables:

```
MONGO_URI=<same value as local .env>
JWT_SECRET=<a long random string>
GOOGLE_CLIENT_ID=<google oauth client id>
FRONTEND_URL=https://itineraryai.in
AI_SERVICE_URL=http://${{itineraryai-agent.RAILWAY_PRIVATE_DOMAIN}}:8080
ALLOWED_ORIGINS=https://itineraryai.in,https://www.itineraryai.in
```

`AI_SERVICE_URL` must be `http`, not `https`. Railway's private network is
already encrypted. The `${{...}}` part is a Railway reference: it fills in the
agent's real private address, which doesn't always match its service name.

Settings:

- **Networking:** generate a public domain. This is `NEXT_PUBLIC_API_URL` below.
- **Healthcheck path:** `/health`.
- **Replicas:** keep at 1. The rate limiter's counters live in process memory,
  so the effective limit is `limit x replicas`.
- **Memory limit:** 512 MB is a sensible ceiling to start with.
- **Serverless:** leave off. The open Mongo connection counts as outbound
  traffic, so the API won't sleep anyway.

### 5. Deploy the frontend to Vercel

Root directory: `frontend`. Env vars (see `frontend/.env.example`):

- `NEXT_PUBLIC_API_URL`: the Railway public domain from step 4, with `https://`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_DEMO_TRIP_ID`: fill in after step 6

**Redeploy after changing any of these.** `NEXT_PUBLIC_*` values are fixed at
build time. If the variable is missing, the site falls back to
`http://localhost:8080` and every API call fails in the visitor's browser.

### 6. Seed the public demo trip

```bash
npm run seed:demo
```

Prints a trip id and a public URL. Put the id in `NEXT_PUBLIC_DEMO_TRIP_ID`
on Vercel and redeploy the frontend.

**Why this exists:** the only path to seeing output today is sign in with
Google → create trip → fill survey → aggregate → wait 60-120s for the agent.
Almost nobody evaluating the project finishes that. `GET /api/trips/:tripId`
is public and `/trip/:tripId/itinerary` renders without auth, so a seeded trip
is an instant, zero-cost look at the real output. The landing page links to it
as "See a sample itinerary — no signup", and the link hides itself when the
env var is unset.

The script is idempotent — re-running updates the same trip.

### 7. Update the Google OAuth client

Add the production origins and redirect URI in Google Cloud Console, or sign-in
fails with `origin_mismatch`.

### 8. Check it works

1. `curl https://<api-domain>/health` returns `{"status":"ok"}`.
2. Sign in on the live site and open an existing trip.
3. Run one full generation and watch it stream to the end.
4. Leave it idle for 15 minutes, then generate again. This is the sleeping
   agent case. The API logs should show `AI service not ready ... retry` lines,
   and the generation should still finish.

## Cost controls

- **Railway limits.** On the Workspace Usage page, under Compute, set the email
  alert to $3 and the hard limit to $10. $10 is the lowest hard limit Railway
  allows, so it can't stop services at $5. At the limit it shuts the services
  down until the limit is raised or the next billing cycle. An alert before
  about day 18 of the cycle means you're on pace to pass the included $5; the
  first thing to check is whether the agent is actually sleeping. The Agent
  column is for Railway's own AI assistant, not this project's agent service.
- **Rate limit.** `middleware/rateLimit.js` caps `/generate-stream` at 3 per
  user and 20 globally per hour (`GENERATE_LIMIT_PER_USER`,
  `GENERATE_LIMIT_GLOBAL`).
- **Hard spend cap on the OpenAI account.** The rate limit bounds call volume;
  only the spend cap bounds actual spend.

## Known gaps

- **`package-lock.json` is gitignored.** That means builds are not
  reproducible and `npm ci` fails on a fresh clone (the Dockerfile uses
  `npm install --omit=dev` to work around it). Worth removing from
  `.gitignore` and committing the lockfile.
- **Chained cold starts.** The first generation after a quiet spell waits for
  the agent to boot (~8-15s) before any LLM work begins. It retries through this
  for up to 23s (`services/aiServiceClient.js`). The seeded demo trip means most
  visitors never pay this.
- **Closing the tab doesn't cancel a generation.** `req.on("close")` in
  `routes/tripRoutes.js` doesn't fire once the body has been parsed, so the
  agent keeps running and spending. The itinerary still gets saved, which may be
  worth keeping. `res.on("close")` is the event that does fire.
- **The 180s timeout only covers the wait for the agent's first response.** It's
  cleared once headers arrive, so a stream that hangs after that stays open.
  Railway's edge closes the browser's connection after 5 minutes with no data.
