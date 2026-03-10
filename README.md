# ItineraryAI

> Planning a group trip is a nightmare. Everyone has different budget, different food taste, different vibe. Someone wants to chill, someone wants adventure. Nobody agrees on anything. Trip gets cancelled before it even starts.
>
> ItineraryAI fixes this. Quietly.

---

## What is this?

ItineraryAI is an **agentic AI system** that plans group trips — and actually makes everyone happy (or at least, as close to happy as possible).

Here's the deal: when you plan a trip with friends, the biggest problem is not finding places — it's managing **everyone's preferences without the drama**. Who wants veg food, who has a low budget, who absolutely cannot do trekking. All of this matters, and it's impossible to keep track of manually.

So we built a system where:
- The organiser creates a trip and shares a survey link
- Every member fills their preferences **anonymously** — no judgment, no peer pressure
- The AI looks at ALL preferences together, finds the common ground, spots the conflicts
- Then it generates a **day-by-day itinerary** that respects everyone's constraints — budget, food, activities, non-negotiables — everything

The AI is not just a simple prompt-to-output thing. It's an **agentic system** — meaning the AI actually uses tools to research real destinations, real stays, real transport options from the web. It thinks, criticizes its own plan, and improves it. More on this below.

---

## How it works (User Flow)

### Step 1: Organiser creates a trip

You sign in with Google, click "Create Trip", give it a name, where you're going from, where you're going to, and how many days. That's it. You get a **survey link**.

### Step 2: Share the link with your group

Send the survey link to your travel buddies — WhatsApp, Instagram, wherever. No sign-up needed for them.

### Step 3: Everyone fills their preferences

Each person fills a quick form (takes like 2 minutes):
- **Travel style** — relaxed? adventure-heavy? party-focused?
- **Food preference** — veg, non-veg, vegan, jain, mixed
- **Accommodation** — hostel, budget hotel, boutique, luxury resort, homestay
- **Activities** — trekking, cafes, nightlife, wildlife, camping, etc. (pick multiple)
- **Budget** — low, medium, high, luxury
- **Non-negotiables** — things they absolutely will not compromise on (no flights, no alcohol, veg-only restaurants, private rooms only, etc.)

Everything is **anonymous**. Nobody knows who picked what. So people are honest.

### Step 4: Organiser generates the itinerary

Once enough people have responded, the organiser hits "Generate Itinerary". The system:

1. **Aggregates** all preferences — finds the majority travel style, food preference, accommodation type. Ranks activities by popularity. Collects ALL non-negotiables (these are absolute — no compromise). Calculates budget range.
2. **Detects conflicts** — like if budget spread is too wide, or travel styles clash badly
3. **Sends everything to the AI service** — which does real research and builds the plan
4. **Streams the result back in real-time** — you see progress as the AI thinks

### Step 5: Share the itinerary

The itinerary gets a shareable link. Anyone can view it — no login needed. Just send the link to the group.

---

## The AI (How the brain works)

The AI service is a **separate microservice** ([AI Service Repo →](https://github.com/lufyDev/itenary_ai)). Here's what makes it special:

### Agentic Architecture

The AI is not just "ask GPT and return the answer". It's an **agent** built with a planner-critic loop:

1. **Planner** — takes the aggregated group data (budget, preferences, constraints) and creates an itinerary
2. **Critic** — reviews the plan, checks if it actually respects all the constraints, points out issues
3. The planner revises based on critique
4. This loop runs until the plan is solid

### Tools (the AI can research)

The LLM (GPT by OpenAI) has access to **three research tools**:

| Tool | What it does |
|------|-------------|
| **Destination Research** | Searches the web for things to do, places to visit, local tips for the destination |
| **Stay/Accommodation Research** | Finds real accommodation options — hostels, hotels, resorts — with price ranges |
| **Transport Research** | Looks up how to get there and get around — trains, buses, flights, local transport |

These tools use **Tavily** (a search API built for AI) to get real, up-to-date information from the web.

### RAG Pipeline (saves cost, improves speed)

Here's the smart part — every time a destination is researched, the results get saved as **embeddings in a vector database (ChromaDB)**. Next time someone plans a trip to the same destination, the tools **first check if we already have that data**. If yes, they skip the web search and just retrieve from the database. If not, they search the web and save the new results.

This means:
- Less API calls = **lower cost**
- Faster results for popular destinations
- Knowledge builds up over time

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        FRONTEND                            │
│               Next.js 16 · React 19                        │
│               Tailwind CSS 4 · Framer Motion               │
│               Port 3000                                    │
│                                                            │
│  Landing Page ──► Create Trip ──► Share Survey Link         │
│       │                                                    │
│  Survey Form (no login needed)                             │
│       │                                                    │
│  Trip Dashboard ──► Generate ──► View Itinerary            │
│       │                              │                     │
│  My Trips Dashboard          Shareable Itinerary Page      │
│                                                            │
└───────────────────────┬────────────────────────────────────┘
                        │ REST API (HTTP)
                        ▼
┌────────────────────────────────────────────────────────────┐
│                     NODE.JS BACKEND                        │
│                Express.js 5 · Port 8080                    │
│                                                            │
│  Auth ──────── Google OAuth + JWT                          │
│  Routes ────── /api/auth    (login, session)               │
│                /api/trips   (create, get, aggregate,       │
│                              generate-stream)              │
│                /api/survey  (submit preferences)           │
│  Services ──── aggregationService (consensus engine)       │
│  Models ────── User, Trip, Member (MongoDB/Mongoose)       │
│                                                            │
└──────┬───────────────────────────────┬─────────────────────┘
       │                               │ SSE Stream
       ▼                               ▼
┌──────────────┐         ┌──────────────────────────────────┐
│   MongoDB    │         │      AI MICROSERVICE             │
│  (Database)  │         │      Python · Port 8000          │
│              │         │                                  │
│  Users       │         │  Planner ◄──► Critic (loop)      │
│  Trips       │         │       │                          │
│  Members     │         │  Tools:                          │
│              │         │   • Destination Research         │
│              │         │   • Stay Research                │
│              │         │   • Transport Research           │
│              │         │       │                          │
│              │         │  Tavily (Web Search)             │
│              │         │       │                          │
│              │         │  ChromaDB (RAG / Vector DB)      │
│              │         │       │                          │
│              │         │  OpenAI GPT (LLM Brain)          │
└──────────────┘         └──────────────────────────────────┘
```

---

## Tech Stack

| What | Technology |
|------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| Backend | Node.js, Express.js 5 |
| Database | MongoDB with Mongoose ODM |
| Auth | Google OAuth 2.0 + JWT tokens |
| AI Brain | OpenAI GPT (via separate microservice) |
| Web Search | Tavily API (used by AI tools) |
| Vector DB | ChromaDB (RAG pipeline in AI service) |
| Validation | Zod |
| Icons | Lucide React |

---

## Project Structure

```
itenaryAI/
├── server.js                  # Express entry point (port 8080)
├── config/
│   └── db.js                  # MongoDB connection
├── middleware/
│   └── auth.js                # JWT auth middleware (authRequired, authOptional)
├── models/
│   ├── User.js                # Google OAuth user
│   ├── Trip.js                # Trip with members, aggregated data, itinerary
│   └── Member.js              # Anonymous member survey responses
├── routes/
│   ├── authRoutes.js          # Google login + session check
│   ├── tripRoutes.js          # Trip CRUD, aggregation, AI generation stream
│   └── surveyRoutes.js        # Survey submission (no auth needed)
├── services/
│   └── aggregationService.js  # Preference consensus engine
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                        # Landing page
│   │   │   ├── layout.tsx                      # Root layout
│   │   │   ├── dashboard/page.tsx              # My trips list
│   │   │   ├── fillSurveyForm/page.tsx         # Survey form (no auth)
│   │   │   └── trip/[tripId]/
│   │   │       ├── page.tsx                    # Organiser dashboard
│   │   │       └── itinerary/page.tsx          # Shareable itinerary view
│   │   ├── components/
│   │   │   ├── CreateTripModal.tsx
│   │   │   ├── ItineraryView.tsx
│   │   │   └── Providers.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx                 # Google auth state management
│   │   └── lib/
│   │       └── api.ts                          # Backend API client
│   └── package.json
│
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Auth? | What it does |
|--------|----------|-------|-------------|
| `POST` | `/api/auth/google` | No | Sign in with Google, get JWT token |
| `GET` | `/api/auth/me` | Yes | Check who's logged in |
| `GET` | `/api/trips/my-trips` | Yes | Get all trips you organised |
| `POST` | `/api/trips/create` | Yes | Create new trip, get survey link |
| `GET` | `/api/trips/:tripId` | No | Get trip details |
| `POST` | `/api/trips/:tripId/aggregate` | Yes | Aggregate all member preferences |
| `POST` | `/api/trips/:tripId/generate-stream` | Yes | Stream AI-generated itinerary (SSE) |
| `POST` | `/api/survey/:tripId` | No | Submit survey (members, no login needed) |

---

## The Aggregation Engine

When the organiser clicks "Generate", the system first aggregates everyone's answers:

- **Budget** — each tier (low/medium/high/luxury) maps to a rupee range. System calculates the overall min, max, and recommended budget for the group
- **Majority preferences** — counts votes for travel style, food preference, accommodation type. Picks what most people want
- **Top activities** — ranks all activities by how many people picked them, takes top 5
- **Non-negotiables** — takes the union (ALL constraints from ALL members). These are absolute — the AI must respect every single one
- **Conflict detection** — flags issues like "budget spread is more than ₹10K" or "people want very different travel styles"

This aggregated data goes to the AI service as a structured input.

---

## Data Models

### User
| Field | Description |
|-------|-------------|
| googleId | Google account identifier |
| email | User email |
| name | Display name |
| picture | Profile photo URL |

### Trip
| Field | Description |
|-------|-------------|
| organiser | Reference to User who created it |
| title | Trip name |
| source | Starting city |
| destination | Where you're going |
| durationDays | How many days |
| members | List of member survey responses |
| aggregatedData | Consensus output (filled after aggregation) |
| itinerary | AI-generated plan (filled after generation) |

### Member
| Field | Description |
|-------|-------------|
| tripId | Which trip this belongs to |
| surveyAnswers | Travel style, food, accommodation, activities, budget, non-negotiables |

---

## Getting Started

### Prerequisites
- Node.js
- MongoDB (running locally or a cloud URI)
- Google OAuth Client ID (from Google Cloud Console)
- The AI microservice running ([see AI service repo](https://github.com/lufyDev/itenary_ai))

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd itenaryAI

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Create .env file in root
# MONGO_URI=mongodb://localhost:27017/itenaryDB
# JWT_SECRET=your-secret-key
# GOOGLE_CLIENT_ID=your-google-client-id
# FRONTEND_URL=http://localhost:3000
# AI_SERVICE_URL=http://localhost:8000

# Create .env.local in frontend/
# NEXT_PUBLIC_API_URL=http://localhost:8080
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Start MongoDB
mongod

# Start backend (port 8080)
npm run dev

# Start frontend (port 3000) — in another terminal
cd frontend && npm run dev
```

Make sure the AI microservice is also running on port 8000.

---

## Key Design Decisions

1. **Anonymous surveys** — members don't need to login. No names attached to preferences. This makes people honest about their actual budget and constraints instead of just agreeing with everyone
2. **Two-phase generation** — aggregation and AI generation are separate steps. Organiser can see how many people responded before spending AI credits
3. **SSE streaming** — itinerary generation is streamed in real-time. You see progress (researching destinations... generating plan... AI critic reviewing...) instead of staring at a loading spinner for 2 minutes
4. **Separate AI microservice** — the AI agent (with tools, RAG, planner-critic loop) runs independently. This backend just sends aggregated data and streams the response. Keeps things clean and independently scalable
5. **RAG for cost saving** — the AI service caches web search results as embeddings. Popular destinations don't need fresh searches every time

---

## Related Repos

- **AI Microservice** — [itenary_ai](https://github.com/lufyDev/itenary_ai) *(the agentic AI service with tools, RAG pipeline, and planner-critic loop)*
