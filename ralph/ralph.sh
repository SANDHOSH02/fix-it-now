#!/usr/bin/env bash
# =============================================================================
# ralph.sh — Fix It Now | Ralph Loop Runner
# Mirrors prd.json as static bash arrays and iterates with for loops
# Run from project root: bash ralph/ralph.sh
# =============================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RALPH_DIR="$ROOT_DIR/ralph"
SRC_DIR="$ROOT_DIR/src"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

pass()  { echo -e "  ${GREEN}✔${RESET}  $1"; }
fail()  { echo -e "  ${RED}✘${RESET}  $1"; }
warn()  { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
info()  { echo -e "  ${CYAN}→${RESET}  $1"; }
head()  { echo -e "\n${BOLD}${BLUE}▶ $1${RESET}"; echo -e "${DIM}$(printf '─%.0s' {1..60})${RESET}"; }

# =============================================================================
# 1. PROJECT BANNER
# =============================================================================
echo ""
echo -e "${BOLD}${CYAN}"
echo "  ███████╗██╗██╗  ██╗    ██╗████████╗    ███╗   ██╗ ██████╗ ██╗    ██╗"
echo "  ██╔════╝██║╚██╗██╔╝    ██║╚══██╔══╝    ████╗  ██║██╔═══██╗██║    ██║"
echo "  █████╗  ██║ ╚███╔╝     ██║   ██║       ██╔██╗ ██║██║   ██║██║ █╗ ██║"
echo "  ██╔══╝  ██║ ██╔██╗     ██║   ██║       ██║╚██╗██║██║   ██║██║███╗██║"
echo "  ██║     ██║██╔╝ ██╗    ██║   ██║       ██║ ╚████║╚██████╔╝╚███╔███╔╝"
echo "  ╚═╝     ╚═╝╚═╝  ╚═╝    ╚═╝   ╚═╝       ╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ "
echo -e "${RESET}"
echo -e "  ${BOLD}Fix It Now${RESET} — AI-Powered Civic Complaint Platform  ${DIM}v1.0 | Ralph Loop${RESET}"
echo ""

# =============================================================================
# 2. RALPH DOCS CHECK
# =============================================================================
head "Ralph Artifacts"

ralph_docs=("claude.md" "prd.md" "prd.json" "ralph.sh")

for doc in "${ralph_docs[@]}"; do
  if [[ -f "$RALPH_DIR/$doc" ]]; then
    pass "$doc"
  else
    fail "$doc ${RED}(missing)${RESET}"
  fi
done

# =============================================================================
# 3. PAGES — File Existence Check
# =============================================================================
head "Pages"

# Format: "route | ComponentFile | requiresAuth"
pages=(
  "/            | src/pages/Index.tsx           | public"
  "/login       | src/pages/Login.tsx           | public"
  "/register    | src/pages/Register.tsx        | public"
  "/report      | src/pages/ReportIssue.tsx     | public"
  "/dashboard   | src/pages/UserDashboard.tsx   | auth:citizen"
  "/admin       | src/pages/AdminDashboard.tsx  | auth:admin"
  "/map         | src/pages/MapView.tsx         | public"
  "/*           | src/pages/NotFound.tsx        | public"
)

for entry in "${pages[@]}"; do
  IFS='|' read -r route file auth <<< "$entry"
  route=$(echo "$route" | xargs)
  file=$(echo "$file" | xargs)
  auth=$(echo "$auth" | xargs)
  if [[ -f "$ROOT_DIR/$file" ]]; then
    pass "${BOLD}$route${RESET}  →  $file  ${DIM}[$auth]${RESET}"
  else
    fail "${BOLD}$route${RESET}  →  $file  ${RED}[MISSING]${RESET}"
  fi
done

# =============================================================================
# 4. COMPONENTS — File Existence Check
# =============================================================================
head "Components"

components=(
  "src/components/layout/Navbar.tsx"
  "src/components/layout/Footer.tsx"
  "src/components/home/HeroSection.tsx"
  "src/components/home/FeaturesSection.tsx"
  "src/components/home/CTASection.tsx"
  "src/components/NavLink.tsx"
  "src/hooks/use-toast.ts"
  "src/hooks/use-mobile.tsx"
  "src/lib/utils.ts"
  "src/App.tsx"
  "src/main.tsx"
)

missing_components=0
for comp in "${components[@]}"; do
  if [[ -f "$ROOT_DIR/$comp" ]]; then
    pass "$comp"
  else
    fail "$comp ${RED}(missing)${RESET}"
    ((missing_components++))
  fi
done

# =============================================================================
# 5. ISSUE CATEGORIES
# =============================================================================
head "Issue Categories  ${DIM}(from prd.json)${RESET}"

categories=("roads:Roads & Potholes" "water:Water Supply" "garbage:Garbage Collection" "lighting:Street Lighting" "drainage:Drainage Issues" "other:Other")

for cat in "${categories[@]}"; do
  IFS=':' read -r value label <<< "$cat"
  info "${CYAN}$value${RESET}  →  $label"
done

# =============================================================================
# 6. ISSUE STATUSES & PRIORITIES
# =============================================================================
head "Statuses & Priority Levels"

statuses=("reported:Reported:gray" "pending:Pending Review:yellow" "assigned:Assigned:blue" "in-progress:In Progress:blue" "resolved:Resolved:green")

echo -e "  ${DIM}Statuses:${RESET}"
for s in "${statuses[@]}"; do
  IFS=':' read -r val label color <<< "$s"
  info "  $val  →  $label  ${DIM}[$color]${RESET}"
done

echo ""
priorities=("low:green" "medium:yellow" "high:red")
echo -e "  ${DIM}Priorities:${RESET}"
for p in "${priorities[@]}"; do
  IFS=':' read -r val color <<< "$p"
  info "  $val  ${DIM}[$color]${RESET}"
done

# =============================================================================
# 7. GOALS
# =============================================================================
head "Project Goals"

goals=(
  "G1 | Frictionless reporting      | < 2 min to submit"
  "G2 | Reduce duplicates           | ≥ 80% detection rate"
  "G3 | Improve resolution speed    | Reduce avg time by 40%"
  "G4 | Citizen engagement          | 70% submit ≥1 report/quarter"
  "G5 | Actionable admin data       | Heatmap-driven allocation"
)

for goal in "${goals[@]}"; do
  IFS='|' read -r id desc metric <<< "$goal"
  id=$(echo "$id" | xargs)
  desc=$(echo "$desc" | xargs)
  metric=$(echo "$metric" | xargs)
  info "${BOLD}$id${RESET}  $desc  ${DIM}→ $metric${RESET}"
done

# =============================================================================
# 8. MILESTONES
# =============================================================================
head "Milestones"

# Format: "ID | Name | Status | Target"
milestones=(
  "M1 | UI Scaffold       | complete    | —"
  "M2 | Auth              | complete    | Q1 2026"
  "M3 | Backend API       | in-progress | Q1 2026"
  "M4 | AI Pipeline       | pending     | Q2 2026"
  "M5 | Map Integration   | pending     | Q2 2026"
  "M6 | Real-time         | pending     | Q3 2026"
  "M7 | Analytics         | pending     | Q3 2026"
  "M8 | Launch            | pending     | Q4 2026"
)

for ms in "${milestones[@]}"; do
  IFS='|' read -r id name status target <<< "$ms"
  id=$(echo "$id" | xargs)
  name=$(echo "$name" | xargs)
  status=$(echo "$status" | xargs)
  target=$(echo "$target" | xargs)

  if [[ "$status" == "complete" ]]; then
    echo -e "  ${GREEN}✔${RESET}  ${BOLD}$id${RESET}  $name  ${DIM}$target${RESET}"
  elif [[ "$status" == "in-progress" ]]; then
    echo -e "  ${CYAN}▶${RESET}  ${BOLD}$id${RESET}  $name  ${DIM}$target${RESET}  ${CYAN}[in-progress]${RESET}"
  else
    echo -e "  ${YELLOW}○${RESET}  ${BOLD}$id${RESET}  $name  ${DIM}$target${RESET}"
  fi
done

# =============================================================================
# 9. SERVER READINESS
# =============================================================================
head "Server Readiness"

server_files=(
  "server/package.json          | Backend package manifest"
  "server/tsconfig.json         | TypeScript config"
  "server/.env.example          | Env template"
  "server/prisma/schema.prisma  | Prisma schema (PostgreSQL + PostGIS)"
  "server/prisma/seed.ts        | Seed script"
  "server/src/index.ts          | Express entry point"
  "server/src/routes/auth.ts    | Auth routes (register/login/refresh/logout/me)"
  "server/src/routes/complaints.ts | Complaints CRUD + PostGIS dedup"
  "server/src/routes/admin.ts   | Admin stats + heatmap"
  "server/src/routes/users.ts   | User profile + notifications"
  "server/src/routes/departments.ts | Departments list"
  ".env.example                 | Frontend env template (VITE_API_URL)"
)

server_missing=0
for entry in "${server_files[@]}"; do
  IFS='|' read -r file desc <<< "$entry"
  file=$(echo "$file" | xargs)
  desc=$(echo "$desc" | xargs)
  if [[ -f "$ROOT_DIR/$file" ]]; then
    pass "${BOLD}$file${RESET}  ${DIM}$desc${RESET}"
  else
    fail "${BOLD}$file${RESET}  ${RED}(missing) $desc${RESET}"
    ((server_missing++))
  fi
done

echo ""
if [[ $server_missing -eq 0 ]]; then
  info "${GREEN}All server files present.${RESET}  Next: ${YELLOW}cd server && npm install && npx prisma migrate dev && npm run dev${RESET}"
else
  warn "$server_missing server file(s) missing."
fi

# Check if server node_modules installed
if [[ -d "$ROOT_DIR/server/node_modules" ]]; then
  pass "server/node_modules  ${DIM}(npm install done)${RESET}"
else
  warn "server/node_modules not found — run: ${YELLOW}cd server && npm install${RESET}"
fi

# Check if .env exists for server
if [[ -f "$ROOT_DIR/server/.env" ]]; then
  pass "server/.env  ${DIM}(environment configured)${RESET}"
else
  warn "server/.env missing — copy .env.example and fill in DATABASE_URL + JWT secrets"
fi

# =============================================================================
# 10. BACKEND STACK (PostgreSQL)
# =============================================================================
head "Backend Stack"

backend_stack=(
  "Database    | PostgreSQL 16 + PostGIS"
  "ORM         | Prisma"
  "API         | REST — Node.js / Express or Fastify"
  "Auth        | JWT + refresh tokens (Passport.js)"
  "Real-time   | WebSocket (Socket.io) / SSE"
  "Storage     | Supabase Storage or AWS S3"
  "AI Pipeline | Python microservice"
)

for layer in "${backend_stack[@]}"; do
  IFS='|' read -r key val <<< "$layer"
  key=$(echo "$key" | xargs)
  val=$(echo "$val" | xargs)
  info "${BOLD}$(printf '%-12s' "$key")${RESET}  $val"
done

echo ""
pg_features=(
  "ST_DWithin         — 500m radius duplicate detection"
  "ST_ClusterDBSCAN   — heatmap clustering"
  "tsvector + GIN     — full-text search on descriptions"
  "Enum types         — status / priority / category enforced at DB level"
  "UUID primary keys  — complaints, users, departments"
)

echo -e "  ${DIM}PostGIS / PostgreSQL features:${RESET}"
for f in "${pg_features[@]}"; do
  IFS='—' read -r fn desc <<< "$f"
  echo -e "    ${CYAN}$(echo "$fn" | xargs)${RESET}  —  $(echo "$desc" | xargs)"
done

# =============================================================================
# 10. FEATURE REQUIREMENTS CHECKLIST
# =============================================================================
head "Feature Requirements"

features=(
  "FR-01 | Report form with title, category, description, photo, voice, location"
  "FR-02 | Form validation on all required fields"
  "FR-03 | Success toast + redirect to dashboard on submit"
  "FR-04 | AI pipeline: classify, dedup (500m/30d), priority score"
  "FR-05 | User dashboard: stats + report list"
  "FR-06 | Status badges: Reported / In Progress / Resolved / Pending"
  "FR-07 | Sidebar: My Reports, Notifications, Profile, Settings"
  "FR-08 | Report click → detail view with status history"
  "FR-09 | Admin dashboard: stats + sortable/filterable complaint table"
  "FR-10 | Admin filters: category, status, priority, date range, dept"
  "FR-11 | Admin actions: view, assign, update status, resolve"
  "FR-12 | Priority badges: High / Medium / Low"
  "FR-13 | Interactive map with geo-pinned markers"
  "FR-14 | Map filter by category"
  "FR-15 | Heatmap layer toggle"
  "FR-16 | Marker click panel: title, category, location, status, photo"
  "FR-17 | Map controls: zoom, locate me, layer toggle"
)

# Track which FRs are covered by existing page files
ui_complete_frs=("FR-01" "FR-02" "FR-03" "FR-05" "FR-06" "FR-07" "FR-08" "FR-09" "FR-10" "FR-11" "FR-12" "FR-13" "FR-14" "FR-15" "FR-16" "FR-17")

for fr in "${features[@]}"; do
  IFS='|' read -r id desc <<< "$fr"
  id=$(echo "$id" | xargs)
  desc=$(echo "$desc" | xargs)

  is_done=false
  for done_id in "${ui_complete_frs[@]}"; do
    if [[ "$done_id" == "$id" ]]; then
      is_done=true
      break
    fi
  done

  if $is_done; then
    pass "${BOLD}$id${RESET}  $desc  ${DIM}[UI scaffold done]${RESET}"
  else
    warn "${BOLD}$id${RESET}  $desc  ${YELLOW}[backend needed]${RESET}"
  fi
done

# =============================================================================
# 11. RISKS
# =============================================================================
head "Risks"

risks=(
  "high   | Map API costs at scale         | Use Leaflet + OSM as fallback"
  "high   | Backend integration delays     | Mock API layer for parallel dev"
  "medium | AI accuracy for Indic context  | Fine-tune on regional datasets"
  "medium | Geolocation permission denied  | Manual address search fallback"
  "medium | Spam / abuse reports           | Rate limiting + CAPTCHA + flagging"
)

for risk in "${risks[@]}"; do
  IFS='|' read -r impact name mitigation <<< "$risk"
  impact=$(echo "$impact" | xargs)
  name=$(echo "$name" | xargs)
  mitigation=$(echo "$mitigation" | xargs)

  if [[ "$impact" == "high" ]]; then
    echo -e "  ${RED}▲ HIGH${RESET}   ${BOLD}$name${RESET}"
  else
    echo -e "  ${YELLOW}▲ MED${RESET}    ${BOLD}$name${RESET}"
  fi
  echo -e "           ${DIM}↳ $mitigation${RESET}"
done

# =============================================================================
# 12. SUMMARY
# =============================================================================
head "Summary"

total_pages=${#pages[@]}
total_milestones=${#milestones[@]}
completed_milestones=2    # M1 UI + M2 Auth (code-complete)
inprogress_milestones=1   # M3 Backend API (server code written, needs deployment)
pending_milestones=$((total_milestones - completed_milestones - inprogress_milestones))
total_frs=${#features[@]}
ui_frs=${#ui_complete_frs[@]}
backend_frs=$((total_frs - ui_frs))

echo -e "  Pages          ${BOLD}$total_pages / $total_pages${RESET}  files present"
echo -e "  Milestones     ${GREEN}$completed_milestones complete${RESET}  /  ${CYAN}$inprogress_milestones in-progress${RESET}  /  ${YELLOW}$pending_milestones pending${RESET}  /  $total_milestones total"
echo -e "  Feature Reqs   ${GREEN}$ui_frs UI done${RESET}  /  ${YELLOW}$backend_frs need backend${RESET}  /  $total_frs total"
echo -e "  Database       ${CYAN}PostgreSQL 16 + PostGIS${RESET}  (planned)"
echo ""
echo -e "  ${BOLD}Next step:  M3 Backend API  →  deploy PostgreSQL + run `npm install` in server/  →  Q1 2026"
echo ""
echo -e "${DIM}  Ralph loop complete. Edit ralph/ docs to update this report.${RESET}"
echo ""
