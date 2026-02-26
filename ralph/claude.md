# Fix It Now — Claude Instructions

## Project Overview
**Fix It Now** is an AI-powered civic complaint reporting and resolution platform built with React + TypeScript + Vite. Citizens report urban infrastructure issues; AI auto-categorizes, deduplicates, and prioritizes them; municipal admins manage resolution workflows.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | TailwindCSS + shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Testing | Vitest |
| Package Manager | Bun |

---

## Project Structure

```
src/
  App.tsx              # Root router + providers
  pages/
    Index.tsx          # Landing page (/)
    ReportIssue.tsx    # Report form (/report)
    UserDashboard.tsx  # Citizen dashboard (/dashboard)
    AdminDashboard.tsx # Admin panel (/admin)
    MapView.tsx        # Interactive map (/map)
    NotFound.tsx       # 404
  components/
    layout/
      Navbar.tsx
      Footer.tsx
    home/
      HeroSection.tsx
      FeaturesSection.tsx
      CTASection.tsx
    ui/                # shadcn/ui component library
  hooks/
    use-toast.ts
    use-mobile.tsx
  lib/
    utils.ts           # cn() helper
ralph/                 # Ralph loop artifacts
```

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `Index` | Landing page with hero, features, CTA |
| `/report` | `ReportIssue` | Submit a civic issue |
| `/dashboard` | `UserDashboard` | Citizen's personal report tracker |
| `/admin` | `AdminDashboard` | Municipal admin complaint management |
| `/map` | `MapView` | Interactive map of all reported issues |

---

## Issue Categories

- `roads` — Roads & Potholes
- `water` — Water Supply
- `garbage` — Garbage Collection
- `lighting` — Street Lighting
- `drainage` — Drainage Issues
- `other` — Other

## Issue Statuses

- `reported` — Newly submitted
- `pending` — Under review
- `assigned` — Assigned to department
- `in-progress` — Being worked on
- `resolved` — Completed

## Priority Levels

- `low` | `medium` | `high`

---

## Key Conventions

- **Path aliases**: `@/` maps to `src/`
- **Components**: Use shadcn/ui primitives from `src/components/ui/`
- **Styling**: TailwindCSS utility classes; custom design tokens in `tailwind.config.ts`
- **Forms**: React Hook Form with Zod schemas for all form validation
- **State**: TanStack Query for server state; React `useState` for local UI state
- **Toasts**: `useToast` hook from `@/hooks/use-toast`
- **Icons**: `lucide-react`

---

## Development Commands

```bash
bun run dev        # Start dev server
bun run build      # Production build
bun run test       # Run tests
bun run lint       # Lint
```

---

## Ralph Loop Guidelines

- All task plans go in `ralph/`
- Keep changes incremental and well-scoped
- Validate UI changes visually against the TailwindCSS design system
- When adding new pages, register the route in `src/App.tsx`
- When adding new components, place them in the appropriate `src/components/` subdirectory
- Backend integration (API calls) should be encapsulated in TanStack Query hooks
- Do not modify files in `src/components/ui/` unless explicitly instructed — these are auto-generated shadcn/ui components
- Always run `bun run lint` and `bun run test` after making changes

---

## Backend (Planned)

| Layer | Technology |
|---|---|
| Database | PostgreSQL 16 + PostGIS extension |
| ORM | Prisma |
| API | REST (Node.js / Express or Fastify) |
| Auth | JWT + refresh tokens (Passport.js) |
| Real-time | WebSocket (Socket.io) or SSE |
| File Storage | Supabase Storage or AWS S3 |
| AI Pipeline | Python microservice (classification, dedup, priority scoring) |

### PostgreSQL Schema Notes
- `complaints` table with `POINT` geometry column via PostGIS for `location`
- Spatial index (`GIST`) on the location column for radius-based duplicate detection
- Enum types for `status`, `priority`, `category`
- `departments`, `users`, `audit_logs` tables
- UUID primary keys

---

## Current Status

The project is in **UI scaffold phase**. All pages and components are built with static/mock data. The next milestone is backend integration (PostgreSQL + API + auth).
