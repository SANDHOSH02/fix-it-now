# Product Requirements Document (PRD)
## Fix It Now — AI-Powered Civic Complaint Platform

**Version:** 1.0  
**Date:** February 26, 2026  
**Status:** In Development  

---

## 1. Executive Summary

**Fix It Now** is a web-based civic complaint reporting and resolution platform that empowers citizens to report urban infrastructure issues while enabling municipal authorities to manage, prioritize, and resolve them efficiently. The platform leverages AI to auto-categorize complaints, detect duplicates, score priority, and surface analytics — reducing manual overhead for city departments and improving response times for citizens.

---

## 2. Problem Statement

Urban infrastructure issues — potholes, broken streetlights, water leaks, garbage overflow — often go unreported or get lost in unstructured complaint pipelines. Citizens lack visibility into resolution status, and municipal departments are burdened by duplicate, misprioritized, or misdirected complaints, resulting in:

- Slow resolution times
- Low citizen trust in local governance
- Inefficient allocation of maintenance resources
- No data-driven insight into recurring problem areas

---

## 3. Goals & Objectives

| # | Goal | Success Metric |
|---|---|---|
| 1 | Make civic issue reporting frictionless | < 2 minutes to submit a report |
| 2 | Reduce duplicate complaints | ≥ 80% duplicate detection rate |
| 3 | Improve resolution speed | Reduce avg. resolution time by 40% |
| 4 | Increase citizen engagement | 70% of registered users submit ≥ 1 report/quarter |
| 5 | Empower admins with actionable data | Admins use heatmap insights for resource allocation |

---

## 4. Target Users

### 4.1 Citizens
- Residents of a municipality who encounter civic issues
- Non-technical; need a simple, mobile-friendly reporting flow
- Want visibility into the status of their reports

### 4.2 Municipal Administrators
- City department staff managing complaint queues
- Need filtering, prioritization, assignment, and resolution workflow tools
- Need analytics to allocate field teams efficiently

---

## 5. Features & Requirements

### 5.1 Landing Page (`/`)
- **Hero section** with product value proposition and primary CTAs (Report Issue, View Map)
- **Features section** highlighting AI capabilities (6 feature cards)
- **CTA section** encouraging sign-up / issue reporting
- Live stats: total issues reported, resolution rate, avg. response time

### 5.2 Issue Reporting (`/report`)

**FR-01** Citizens must be able to submit a complaint with the following fields:
- Title (text)
- Category (Roads, Water, Garbage, Lighting, Drainage, Other)
- Description (textarea)
- Photo upload (drag-and-drop or file picker, image preview)
- Voice note recording (start/stop)
- Auto geo-location capture (browser Geolocation API)
- Manual location search (fallback)

**FR-02** Form must validate all required fields before submission.

**FR-03** On submission, the system must display a success toast and redirect the user to their dashboard.

**FR-04** AI processing pipeline must (backend):
- Auto-classify the issue category from description + photo
- Check for duplicate submissions within a 500m radius in the last 30 days
- Assign an initial priority score (low / medium / high)

### 5.3 User Dashboard (`/dashboard`)

**FR-05** Authenticated citizens can view:
- Summary statistics (Total Reports, In Progress, Resolved, Pending)
- A list of their submitted reports with: title, category, status badge, date, location

**FR-06** Reports must support status badges:
- `Reported` (gray), `In Progress` (blue), `Resolved` (green), `Pending` (yellow)

**FR-07** Sidebar navigation: My Reports, Notifications, Profile, Settings

**FR-08** Clicking a report opens a detail view with full information and status history.

### 5.4 Admin Dashboard (`/admin`)

**FR-09** Admins can view all complaints with:
- Summary stats (Total Complaints, Pending Review, Resolved Today, Active Citizens)
- Sortable, filterable table: Title, Category, Location, Reporter, Priority, Status, Date, Department

**FR-10** Admins can filter by: category, status, priority, date range, department.

**FR-11** Admins can perform actions per complaint:
- View details (modal)
- Assign to department
- Update status
- Mark as resolved

**FR-12** Priority badges: High (red), Medium (yellow), Low (green).

### 5.5 Map View (`/map`)

**FR-13** Interactive map displaying all reported issues as geo-pinned markers.

**FR-14** Filter markers by category (All, Roads, Water, Garbage, Lighting, Drainage).

**FR-15** Toggle heatmap layer to visualize issue density clusters.

**FR-16** Clicking a marker shows a panel with issue title, category, location, status, and photo.

**FR-17** Map controls: zoom in/out, locate me, layer toggle.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Page load < 2s on 4G; map renders < 3s with 1000+ markers |
| Accessibility | WCAG 2.1 AA compliance |
| Responsiveness | Fully functional on mobile (320px+), tablet, desktop |
| Security | Auth-protected dashboards; no PII exposed in public map |
| Scalability | Support 100,000+ reports without UI degradation |
| Uptime | 99.5% availability |

---

## 7. Design System

- **Framework**: TailwindCSS with custom design tokens
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Color roles**: `primary`, `accent`, `success`, `warning`, `destructive`, `info`, `muted`
- **Motion**: Subtle fade-in and slide animations; `animate-pulse-soft` for live indicators

---

## 8. Technical Architecture

```
Frontend (React + TypeScript + Vite)
  └── Pages (React Router v6)
  └── State: TanStack Query (server) + React useState (local)
  └── Forms: React Hook Form + Zod
  └── UI: shadcn/ui + TailwindCSS

Backend (Node.js — to be integrated)
  └── REST API (Express / Fastify)
  └── Auth: JWT + refresh tokens (Passport.js)
  └── ORM: Prisma
  └── Database: PostgreSQL 16 + PostGIS extension
      └── complaints table (UUID PK, POINT geometry for location, GIST spatial index)
      └── users, departments, audit_logs tables
      └── Enum types: status, priority, category
  └── AI pipeline: Python microservice (auto-classify, deduplicate within 500m radius, priority scoring)
  └── Real-time: WebSocket (Socket.io) or SSE for status updates
  └── File storage: Supabase Storage or AWS S3 (complaint photos)
```

### PostgreSQL + PostGIS rationale
- Native geospatial queries (radius-based duplicate detection, heatmap clustering) via PostGIS `ST_DWithin` and `ST_ClusterDBSCAN`
- ACID compliance for complaint audit trail
- Full-text search on complaint descriptions with `tsvector` / `GIN` index
- Enum types enforced at DB level for status, priority, category

---

## 9. Out of Scope (v1.0)

- Native mobile apps (iOS / Android)
- Multi-city/multi-municipality support
- Payment or reward system for reporters
- Integration with government ERP systems
- Offline-first PWA capabilities

---

## 10. Milestones

| Milestone | Deliverables | Target |
|---|---|---|
| M1 — UI Scaffold | All pages, static mock data, design system | ✅ Complete |
| M2 — Auth | Registration, login, role-based access (citizen vs admin) | Q1 2026 |
| M3 — Backend API | PostgreSQL 16 + PostGIS schema, Prisma ORM, REST API (complaints, departments, users) | Q1 2026 |
| M4 — AI Pipeline | Categorization, dedup, priority scoring | Q2 2026 |
| M5 — Map Integration | Real map tiles (Mapbox / Google Maps), live markers | Q2 2026 |
| M6 — Real-time | WebSocket status updates, push notifications | Q3 2026 |
| M7 — Analytics | Admin heatmaps, trend charts, export | Q3 2026 |
| M8 — Launch | Public launch, performance hardening | Q4 2026 |

---

## 11. Dependencies & Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Map API costs at scale | High | Cache tile layers; use open-source alternative (Leaflet + OSM) |
| AI model accuracy for Indic context | Medium | Fine-tune on regional complaint datasets |
| Geolocation permissions denied | Medium | Provide manual address search as fallback |
| Spam/abuse reports | Medium | Rate limiting + CAPTCHA + report flagging |
| Backend integration delays | High | Mock API layer in frontend for parallel development |
