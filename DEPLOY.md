# Deploying ItineraryAI

Three pieces plus a database:

| Piece | Where | Why |
|---|---|---|
| Next frontend | Vercel Hobby, `itineraryai.in` | Always up, instant, free |
| Express API (this repo root) | Scale-to-zero container (Cloud Run / Fly) | Holds a 180s SSE stream — longer than a Vercel Hobby function allows |
| FastAPI agent (`itenary_ai` repo) | Scale-to-zero container | 400MB of deps, needs a writable filesystem |
| MongoDB | Atlas M0 | Free tier, no expiry |

Target cost: **$0-1/month**, plus domain renewal.

## Why the API is not folded into Next

`POST /api/trips/:tripId/generate-stream` opens an SSE response and proxies
the Python stream for up to 180s (`routes/tripRoutes.js`). Vercel Hobby caps
function duration well below that, so moving this route to Next would mean
restructuring it into enqueue-and-poll. The other routes would move fine; this
one is the blocker. Revisit if the generation ever gets split into a job queue.

## Order of operations

### 1. MongoDB Atlas (free M0)

Create an M0 cluster, a database user, and allow access from anywhere
(`0.0.0.0/0`) since Cloud Run egress IPs are not static. Grab the connection
string for `MONGO_URI`.

### 2. Deploy the agent service

See `DEPLOY.md` in the `itenary_ai` repo. Note the URL it gives you — that is
`AI_SERVICE_URL` below.

### 3. Deploy this API

```bash
gcloud run deploy itineraryai-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300 \
  --max-instances 2 \
  --set-env-vars "MONGO_URI=...,JWT_SECRET=...,GOOGLE_CLIENT_ID=...,FRONTEND_URL=https://itineraryai.in,AI_SERVICE_URL=https://...,ALLOWED_ORIGINS=https://itineraryai.in,https://www.itineraryai.in"
```

`--timeout 300` has to exceed the 180s the SSE route can hold. Node's own
socket timeouts are widened to match in `server.js`.

### 4. Deploy the frontend to Vercel

Root directory: `frontend`. Env vars (see `frontend/.env.example`):

- `NEXT_PUBLIC_API_URL` — the Cloud Run URL from step 3
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_DEMO_TRIP_ID` — fill in after step 5

Point `itineraryai.in` at Vercel, then add both the apex and `www` to
`ALLOWED_ORIGINS` on the API.

### 5. Seed the public demo trip

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

### 6. Update the Google OAuth client

Add the production origin and redirect URI in Google Cloud Console, or sign-in
fails with `origin_mismatch`.

## Cost controls

Both are in place but worth re-checking before sharing the link:

- **Rate limit.** `middleware/rateLimit.js` caps `/generate-stream` at 3 per
  user and 20 globally per hour (`GENERATE_LIMIT_PER_USER`,
  `GENERATE_LIMIT_GLOBAL`). Counters are in process memory, so the effective
  limit is `limit x instances` — keep `--max-instances` low.
- **Hard spend cap on the OpenAI account.** The rate limit bounds call volume;
  only the spend cap bounds actual spend.

## Known gaps

- **`package-lock.json` is gitignored.** That means builds are not
  reproducible and `npm ci` fails on a fresh clone (the Dockerfile uses
  `npm install --omit=dev` to work around it). Worth removing from
  `.gitignore` and committing the lockfile.
- **Two chained cold starts.** A live generation hits the API cold start
  (~1s) then the agent cold start (~8-15s) before any LLM work begins. The
  seeded demo trip means most visitors never pay this.
