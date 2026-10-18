# Ardhnarishwar Official Website & AI Platform

An enterprise-grade, comprehensive platform combining AI-driven talent acquisition, workforce automation, candidate & client portals, and an intelligent **Interactive Website Helper Bot, Page Explainer & Live Connected Modules Directory**.

---

## 🚀 Key Systems & Architecture

### 1. Interactive Website AI Helper & Voice Explainer
- **Floating AI Guide**: Always-accessible contextual assistant on every page.
- **Context-Aware Page Explainer**: Instantly explains the current page's purpose, clickable features, and interactive actions across all 30+ platform routes and dynamic `/services/:slug` pages.
- **Live Connected Modules Enterprise Walkthrough**: Complete structured breakdown of live enterprise modules across 5 operational domains, with individual deep-dives by name or acronym (HRMS, Smart Attendance, CRM, AI Recruitment, etc.).
- **Audio Voice Explainer**: Integrated browser SpeechSynthesis narration explaining the platform vision, ecosystem, and modules with play/stop/pause controls.
- **5 Core Strategic Pillars**:
  1. Human-AI Harmony
  2. End-to-End Enterprise Suite
  3. Context-Aware Intelligence
  4. Role-Based Experience
  5. Privacy-First Security
- **Interactive Guided Tours**: Step-by-step glowing spotlight walkthroughs with auto-scroll and tooltips.
- **Admin Feedback & Insights**: Real-time logging of user inquiries, ratings, and feedback at `/admin/helper-bot`.

### 2. Core Portals & Workflows
- **Public & Corporate Site**: Modern animations, dark/light theme switching, responsive design, client stories, and technology showcase.
- **AI Recruitment & Assessment**: Automated interview workflows, AI scoring, resume screening, and candidate tracking.
- **Smart Attendance & Workforce Management**: Real-time biometric/geo check-ins, leave approvals, shifts, and analytics.
- **Candidate Portal**: Profile management, application tracking, online test environment, and career trajectory.
- **Client & Corporate Portal**: Job requisition management, candidate pipeline review, and contract management.
- **CRM & Customer Operations**: Lead scoring, pipeline stages, client communication logs, and customer support ticketing.
- **Admin Hub**: Unified management of users, interviews, jobs, analytics, and AI helper bot insights.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TailwindCSS / Vanilla CSS tokens, Lucide Icons, GSAP ScrollTrigger animations.
- **Backend**: Node.js, Express.js REST API with CORS and JSON middleware.
- **Database**: MySQL with Sequelize ORM (auto-syncing models, migrations, and seeds).
- **Audio / Speech**: Web SpeechSynthesis API for zero-dependency natural voice explanation.

---

## ⚙️ Quick Start

### 1. Database Setup
Ensure MySQL is running on port 3306 with database `ardhnarishwar_db`:
```bash
# Backend .env configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ardhnarishwar_db
```

### 2. Backend API
```bash
cd backend
npm install
node src/server.js
# Server runs on http://localhost:5000
```

### 3. Frontend Client
```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5173
```

### 4. Production Build
```bash
cd frontend
npm run build
# Dist generated in frontend/dist
```

---

## 📍 Important Routes

| Route | Description |
|---|---|
| `/` | Landing page with Hero "Explain Website & Features" CTA |
| `/services` | Comprehensive 20-Module Enterprise Services Catalog |
| `/services/:slug` | Dynamic individual service showcase & browser demo simulation |
| `/login` | Unified authentication portal |
| `/candidate/*` | Candidate dashboard, interviews & tests |
| `/client/*` | Enterprise client hiring portal |
| `/admin/*` | Executive admin dashboard |
| `/admin/helper-bot` | AI Helper Bot logs, statistics & tour simulator |
| `/api/helper-bot/*` | Backend REST endpoints for AI chat, tours, features & feedback |

---

*Updated: September 2026*
