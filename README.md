# ItineraryAI

AI-powered group trip planning. Everyone shares their preferences privately, and AI crafts the itinerary the whole group will love.

---

## System Architecture

### High-Level Overview

ItineraryAI is a full-stack application with a decoupled frontend and backend communicating over REST APIs, plus an external AI service (OpenAI) for itinerary generation.

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│              Next.js 16 (App Router) + React 19                 │
│              Tailwind CSS 4 · Framer Motion                     │
│              Port 3000                                          │
│                                                                 │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ Landing  │ │  Survey    │ │    Trip      │ │  Shared     │  │
│  │  Page    │ │  Form      │ │  Dashboard   │ │  Itinerary  │  │
│  │  /       │ │ /fillSurvey│ │ /trip/[id]   │ │ /trip/[id]/ │  │
│  │          │ │  Form      │ │              │ │  itinerary  │  │
│  └────┬─────┘ └─────┬──────┘ └──────┬───────┘ └──────┬──────┘  │
│       │              │               │                │         │
│       └──────────────┴───────┬───────┴────────────────┘         │
│                              │                                  │
│                    src/lib/api.ts                                │
│                   (API Client Layer)                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │  HTTP (REST)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
│                Express.js 5 · Node.js                            │
│                Port 8080                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                    Routes Layer                          │     │
│  │  ┌──────────────────┐    ┌───────────────────┐          │     │
│  │  │  tripRoutes.js   │    │  surveyRoutes.js  │          │     │
│  │  │  /api/trips/*    │    │  /api/survey/*    │          │     │
│  │  └────────┬─────────┘    └─────────┬─────────┘          │     │
│  └───────────┼────────────────────────┼────────────────────┘     │
│              │                        │                          │
│  ┌───────────┼────────────────────────┼────────────────────┐     │
│  │           ▼      Services Layer    ▼                    │     │
│  │  ┌────────────────────┐  ┌──────────────────────┐       │     │
│  │  │ aggregationService │  │  plannerService.js   │───────┼──►  OpenAI API
│  │  │  (data consensus)  │  │  (OpenAI GPT-4o-mini)│       │     │
│  │  └────────────────────┘  └──────────────────────┘       │     │
│  └─────────────────────────────────────────────────────────┘     │
│              │                                                   │
│  ┌───────────┼─────────────────────────────────────────────┐     │
│  │           ▼         Models Layer                        │     │
│  │  ┌──────────────┐    ┌──────────────┐                   │     │
│  │  │   Trip.js    │◄──►│  Member.js   │                   │     │
│  │  │  (Mongoose)  │    │  (Mongoose)  │                   │     │
│  │  └──────────────┘    └──────────────┘                   │     │
│  └─────────────────────────────────────────────────────────┘     │
│              │                                                   │
└──────────────┼───────────────────────────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │   MongoDB    │
        │  itenaryDB   │
        │  Port 27017  │
        └──────────────┘
```

---

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16.1.6 |
| UI Framework | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.574 |
| Backend | Express.js | 5.2.1 |
| Database | MongoDB (Mongoose ODM) | 9.2.1 |
| AI Engine | OpenAI (GPT-4o-mini) | SDK 6.22 |
| Validation | Zod | 4.3.6 |

---

### Project Structure

```
itenaryAI/
├── server.js                  # Express entry point (port 8080)
├── config/
│   └── db.js                  # MongoDB connection
├── models/
│   ├── Trip.js                # Trip schema
│   └── Member.js              # Member + survey answers schema
├── routes/
│   ├── tripRoutes.js          # Trip CRUD & generation endpoints
│   └── surveyRoutes.js        # Survey submission endpoint
├── services/
│   ├── aggregationService.js  # Preference aggregation logic
│   └── plannerService.js      # OpenAI itinerary generation
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                        # Landing page
│       │   ├── layout.tsx                      # Root layout
│       │   ├── globals.css                     # Global styles
│       │   ├── fillSurveyForm/page.tsx         # Survey form
│       │   └── trip/[tripId]/
│       │       ├── page.tsx                    # Organizer dashboard
│       │       └── itinerary/page.tsx          # Shared itinerary view
│       ├── components/
│       │   ├── CreateTripModal.tsx             # Trip creation modal
│       │   └── ItineraryView.tsx               # Itinerary renderer
│       └── lib/
│           └── api.ts                          # API client (typed fetch wrappers)
├── package.json
└── .env
```

---

### Data Models

#### Trip

| Field | Type | Description |
|-------|------|-------------|
| `organiserName` | String (required) | Name of the trip organizer |
| `title` | String (required) | Trip title |
| `durationDays` | Number (required) | Trip length in days |
| `members` | ObjectId[] → Member | References to member survey responses |
| `aggregatedData` | Object | Consensus data (populated after aggregation) |
| `itinerary` | Object | AI-generated itinerary (populated after generation) |

#### Member

| Field | Type | Description |
|-------|------|-------------|
| `tripId` | ObjectId → Trip (required) | Parent trip reference |
| `surveyAnswers.travelStyle` | Enum | relaxed, balanced, adventure-heavy, party-focused, explore-max |
| `surveyAnswers.foodPreference` | Enum | veg, non-veg, mixed, vegan, jain |
| `surveyAnswers.accommodationType` | Enum | hostel, budget-hotel, boutique-hotel, luxury-resort, homestay |
| `surveyAnswers.activities` | Enum[] | Up to 12 activity types |
| `surveyAnswers.budget` | Enum | low, medium, high, luxury |
| `surveyAnswers.nonNegotiables` | Enum[] | Up to 9 constraint types |

---

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/trips/create` | Create a new trip, returns trip + survey link |
| `GET` | `/api/trips/:tripId` | Fetch trip details by ID |
| `POST` | `/api/trips/:tripId/aggregate` | Aggregate all member preferences into consensus |
| `POST` | `/api/trips/:tripId/generate` | Generate AI itinerary (requires prior aggregation) |
| `POST` | `/api/survey/:tripId` | Submit one member's survey answers |

---

### User Flow

```
Organizer                    Frontend                  Backend                 OpenAI        MongoDB
   │                            │                        │                       │              │
   │──Create Trip──────────────►│                        │                       │              │
   │                            │──POST /trips/create───►│                       │              │
   │                            │                        │───────save Trip──────────────────────►
   │                            │◄──{ trip, surveyLink }─┤                       │              │
   │◄──Survey link + dashboard──┤                        │                       │              │
   │                            │                        │                       │              │
   │  (shares link to group)    │                        │                       │              │
   │                            │                        │                       │              │
Members                         │                        │                       │              │
   │──Fill survey──────────────►│                        │                       │              │
   │                            │──POST /survey/:id─────►│                       │              │
   │                            │                        │───save Member─────────────────────────►
   │                            │                        │───push to Trip.members────────────────►
   │◄──Confirmation─────────────┤                        │                       │              │
   │                            │                        │                       │              │
Organizer                       │                        │                       │              │
   │──Generate Itinerary───────►│                        │                       │              │
   │                            │──POST /:id/aggregate──►│                       │              │
   │                            │                        │──fetch all Members────────────────────►
   │                            │                        │◄─────────────────────────────────────┤
   │                            │                        │──aggregateTripData()   │              │
   │                            │                        │──save aggregatedData──────────────────►
   │                            │◄──aggregated trip──────┤                       │              │
   │                            │                        │                       │              │
   │                            │──POST /:id/generate───►│                       │              │
   │                            │                        │──generateItinerary()──►│              │
   │                            │                        │  (system + user prompt)│              │
   │                            │                        │◄──JSON itinerary───────┤              │
   │                            │                        │──save itinerary────────────────────────►
   │                            │◄──itinerary JSON───────┤                       │              │
   │◄──Rendered itinerary───────┤                        │                       │              │
```

---

### Services

#### Aggregation Service

Takes all member survey responses and produces a group consensus:

- **Budget** — maps tiers (low/medium/high/luxury) to rupee ranges, computes min/max/recommended
- **Majority Preferences** — counts votes for travelStyle, foodPreference, accommodationType; picks the most popular
- **Top Activities** — ranked by frequency across all members, top 5 returned
- **Non-Negotiables** — union of all members' dealbreakers (respected absolutely)
- **Conflict Detection** — flags large budget gaps (>₹10K spread) or divergent travel styles

#### Planner Service

Sends a structured prompt to OpenAI GPT-4o-mini (temperature 0.4) with:

- **System prompt**: strict rules — respect budget, non-negotiables, conflicts, duration; output strict JSON only
- **User prompt**: trip title, duration, and full aggregated data

Returns structured JSON:

```json
{
  "summary": "string",
  "days": [
    {
      "day": 1,
      "morning": "string",
      "afternoon": "string",
      "evening": "string",
      "stay": "string",
      "estimatedCostPerPerson": 2500
    }
  ],
  "totalEstimatedCostPerPerson": 12000,
  "tradeOffExplanation": "string"
}
```

---

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `FRONTEND_URL` | Frontend origin (used for survey link generation) |
| `OPENAI_API_KEY` | OpenAI API key |
| `NEXT_PUBLIC_API_URL` | Backend base URL (used by frontend) |

---

### Getting Started

```bash
# 1. Install backend dependencies
npm install

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Set up environment variables
#    Copy .env.example to .env and fill in values

# 4. Start MongoDB
mongod

# 5. Start the backend (port 8080)
npm run dev

# 6. Start the frontend (port 3000)
cd frontend && npm run dev
```

---

### Key Design Decisions

1. **Decoupled frontend/backend** — Next.js on port 3000, Express on 8080, connected via REST with CORS enabled.
2. **Anonymous surveys** — Member documents store no names or identities, only preferences and a trip reference.
3. **Two-phase generation** — Aggregation and AI generation are separate API calls, letting the organizer review response count before triggering the costlier AI step.
4. **Structured AI output** — The system prompt enforces a strict JSON schema; the response is `JSON.parse`d directly.
5. **Client-side data fetching** — All pages are client components fetching data on mount via `useEffect`, keeping the architecture simple.
