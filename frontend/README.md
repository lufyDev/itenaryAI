# ItineraryAI — Frontend

The frontend for [ItineraryAI](https://itineraryai.in), a group trip planning system powered by agentic AI. Built with Next.js 16, React 19, Tailwind CSS 4, and Framer Motion.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations and transitions |
| @react-oauth/google | Google OAuth login |
| Lucide React | Icons |
| TypeScript | Type safety |

## Pages

| Route | Auth? | Description |
|-------|-------|-------------|
| `/` | No | Landing page |
| `/dashboard` | Yes | Organiser's trip list |
| `/trip/[tripId]` | Yes | Trip dashboard (manage members, aggregate, generate) |
| `/trip/[tripId]/itinerary` | No | Shareable itinerary view |
| `/fillSurveyForm?tripId=...` | No | Survey form for group members |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Landing page
│   │   ├── layout.tsx                      # Root layout
│   │   ├── globals.css                     # Global styles
│   │   ├── dashboard/page.tsx              # My trips list
│   │   ├── fillSurveyForm/page.tsx         # Survey form (no auth)
│   │   └── trip/[tripId]/
│   │       ├── page.tsx                    # Organiser dashboard
│   │       └── itinerary/page.tsx          # Shareable itinerary view
│   ├── components/
│   │   ├── CreateTripModal.tsx             # Trip creation modal
│   │   ├── ItineraryView.tsx               # Itinerary display component
│   │   └── Providers.tsx                   # Context providers wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx                 # Google auth state management
│   └── lib/
│       └── api.ts                          # Backend API client
└── package.json
```

## Setup

### Prerequisites

- Node.js 20+
- Backend API running on port 8080 ([see main repo](https://github.com/lufyDev/itenaryAI))

### Install and Run

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL. Use `http://localhost:8080` for local dev, `/api` for production (Nginx proxies to backend) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com) |

### Production Build

```bash
npm run build
npm start
```

In production, the frontend runs on port 3000 behind Nginx, managed by PM2.

## How It Connects

```
Browser ──► Nginx (port 80/443)
               │
               ├── /           → Frontend (port 3000)
               └── /api/*      → Backend (port 8080)
```

In development, the frontend talks directly to `http://localhost:8080`. In production, it uses `/api` and Nginx routes the request to the backend. This avoids CORS issues and keeps everything on the same domain.
