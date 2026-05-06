# TaskFlow AI — Project & Team Management Platform

<div align="center">

![TaskFlow AI](https://img.shields.io/badge/TaskFlow-AI%20Native-6366f1?style=for-the-badge&logo=checkmarx&logoColor=white)
![Railway](https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**A full-stack AI-powered project management web application with role-based access control, real-time dashboards, and an intelligent NLP agent.**

[🌐 Live Demo](https://perfect-art-production-f58f.up.railway.app) · [🔧 API](https://taskflow-ai-production-9675.up.railway.app/health) · [📁 GitHub](https://github.com/SaiCharan-99/taskflow-ai)

</div>

---

## 🚀 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://perfect-art-production-f58f.up.railway.app |
| **Backend API** | https://taskflow-ai-production-9675.up.railway.app |
| **Health Check** | https://taskflow-ai-production-9675.up.railway.app/health |

> Deployed on [Railway](https://railway.app) with automatic CI/CD from GitHub.

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin (CEO)** | `ceo@taskflow.com` | `Admin@123` |
| **Manager (CTO)** | `cto@taskflow.com` | `Manager@123` |
| **Employee (Frontend Dev)** | `fe-dev@taskflow.com` | `Employee@123` |
| **Intern** | `intern@taskflow.com` | `Intern@123` |

> 12 pre-seeded employees across Engineering, Product, and Operations teams.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based login/logout with 7-day token expiry
- OTP email verification on signup (via Gmail SMTP)
- Password hashing with bcryptjs
- Protected routes — unauthenticated users redirected to login

### 👥 Role-Based Access Control (RBAC)
| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full access — create/delete projects, manage all members, use AI Agent |
| **MANAGER** | Create projects, manage team members, assign tasks |
| **MEMBER** | View assigned projects, create/update tasks they own |

### 📁 Project Management
- Create, edit, and delete projects
- Add/remove team members per project with specific roles
- Risk level indicators (LOW / MEDIUM / HIGH) auto-calculated from overdue tasks
- Project-level activity logs

### ✅ Task Management
- Create tasks with title, description, priority, due date, assignee
- Drag-and-drop Kanban board (TODO → IN_PROGRESS → REVIEW → DONE)
- Task list view with filters by status, priority, and assignee
- Overdue task highlighting

### 📊 Dashboard & Analytics
- Per-project dashboard: total tasks, completed, in-progress, overdue
- Risk level auto-calculated based on overdue ratio
- Team insights: member count, active tasks, role reports
- Recent activity feed

### 🤖 AI Agent (Admin only)
- Natural language commands via Google Gemini AI
- Create projects: *"Create a new project called Mobile App with description..."*
- Create tasks: *"Create a task in Website Redesign for Alex Johnson due next Friday"*
- Real-time UI refresh after AI-triggered changes

### 🔔 Notifications
- In-app notification bell with unread count badge
- Notifications on task assignment, project membership, and task updates
- Mark individual / all notifications as read

### 👨‍👩‍👧‍👦 Team Management
- Org chart with hierarchical view (CEO → C-Suite → Leads → ICs → Intern)
- Team overview with member counts and manager info
- Role upgrade request system (Members can request MANAGER/ADMIN)

### ⚙️ Settings
- Update display name and email
- Change password
- Role upgrade request (Members only)

---

## 🗂️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| Prisma ORM | Database access & migrations |
| PostgreSQL | Primary database |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Nodemailer | OTP email via Gmail SMTP |
| Google Gemini AI | NLP agent |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Axios | API client |
| Framer Motion | Animations |
| Recharts | Dashboard charts |
| @dnd-kit | Drag-and-drop Kanban |
| Lucide React | Icons |

### Infrastructure
| Service | Usage |
|---------|-------|
| Railway | Hosting (backend + frontend + Postgres) |
| GitHub | Source control + CI/CD trigger |
| Gmail SMTP | OTP email delivery |

---

## 🏗️ Project Structure

```
taskflow-ai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # 12-employee org seed data
│   │   └── migrations/          # SQL migrations
│   ├── src/
│   │   ├── index.ts             # Express server entry point
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT auth + RBAC middleware
│   │   ├── routes/
│   │   │   ├── auth.ts          # Login, signup, OTP, verify
│   │   │   ├── projects.ts      # Project CRUD + members
│   │   │   ├── tasks.ts         # Task CRUD + Kanban
│   │   │   ├── dashboard.ts     # Analytics & activity feed
│   │   │   ├── agent.ts         # AI agent (Gemini NLP)
│   │   │   ├── teams.ts         # Team management
│   │   │   ├── notifications.ts # In-app notifications
│   │   │   └── roleRequests.ts  # Role upgrade requests
│   │   ├── lib/
│   │   │   └── prisma.ts        # Prisma singleton client
│   │   └── utils/
│   │       └── helpers.ts       # bcrypt, OTP, SMTP, dashboard utils
│   ├── Dockerfile               # Production Docker image
│   ├── railway.json             # Railway deployment config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API clients per domain
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, TopBar, Layout
│   │   │   ├── agent/           # AI Agent drawer
│   │   │   ├── kanban/          # Drag-and-drop board
│   │   │   └── shared/          # Reusable UI components
│   │   ├── context/
│   │   │   ├── AuthContext.tsx  # User auth state
│   │   │   └── ProjectContext.tsx # Active project state
│   │   ├── pages/               # Route-level page components
│   │   └── utils/               # Date, color, formatting helpers
│   ├── railway.json             # Railway frontend config
│   └── package.json
├── .gitattributes               # Force LF line endings for .sh files
├── .gitignore
├── docker-compose.yml           # Local development setup
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Gmail account with App Password enabled

### 1. Clone the repository
```bash
git clone https://github.com/SaiCharan-99/taskflow-ai.git
cd taskflow-ai
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env  # Fill in your values
npm install
npx prisma migrate dev
npm run seed          # Creates 12 employees + 3 projects
npm run dev           # Starts on http://localhost:3001
```

### 3. Frontend setup
```bash
cd frontend
cp .env.example .env  # Set VITE_API_URL=http://localhost:3001
npm install
npm run dev           # Starts on http://localhost:5173
```

### Environment Variables

**Backend `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow
JWT_SECRET=your-32-char-secret-here
JWT_EXPIRY=7d
NODE_ENV=development
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3001
```

---

## 🌐 Railway Deployment Guide

### Architecture
- **Backend service** — Docker build from `backend/` directory
- **Frontend service** — Nixpacks build from `frontend/` directory  
- **Postgres service** — Managed PostgreSQL with persistent volume

### Backend Variables (Railway)
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Reference → Postgres.DATABASE_URL |
| `JWT_SECRET` | 32+ character random string |
| `JWT_EXPIRY` | `7d` |
| `NODE_ENV` | `production` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password |
| `GMAIL_USER` | Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail App Password |
| `GEMINI_API_KEY` | Google AI Studio key |
| `FRONTEND_URL` | Railway frontend domain |

### Frontend Variables (Railway)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Railway backend domain |

### First Deploy Steps
1. Push to GitHub → Railway auto-deploys
2. Backend runs `prisma migrate deploy` on startup automatically
3. Seed the database once:
```bash
# Using the Railway Postgres public URL from Railway → Postgres → Variables → DATABASE_PUBLIC_URL
$env:DATABASE_URL="<railway-public-url>"; npx prisma migrate deploy; npm run seed
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/signup` | Register new account |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all accessible projects |
| POST | `/api/projects` | Create project (ADMIN/MANAGER) |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (ADMIN) |
| POST | `/api/projects/:id/members` | Add member to project |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List project tasks |
| POST | `/api/projects/:id/tasks` | Create task |
| PATCH | `/api/projects/:id/tasks/:taskId` | Update task (status, assignee, etc.) |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task |

### Dashboard & Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/:projectId` | Project analytics |
| GET | `/api/teams` | All teams + members |
| GET | `/api/notifications` | User notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification read |
| POST | `/api/agent/chat` | AI agent (ADMIN only) |

---

## 🏢 Organizational Hierarchy

```
CEO — Robert Chen  (ceo@taskflow.com)
├── CTO — Sarah Anderson  (cto@taskflow.com)
│   ├── Sr. Frontend — Alex Johnson  (fe-lead@taskflow.com)
│   │   ├── FE Dev — James Mitchell  (fe-dev@taskflow.com)
│   │   └── Intern — Lucas Rodriguez  (intern@taskflow.com)
│   ├── Sr. Backend — Emma Wilson  (be-lead@taskflow.com)
│   │   └── BE Dev — Michael Chen  (be-dev@taskflow.com)
│   └── QA Eng — Sophie Martin  (qa@taskflow.com)
├── Head of Product — Maria Garcia  (product-head@taskflow.com)
│   └── PM — Jessica Park  (pm@taskflow.com)
└── Ops Manager — David Kumar  (ops@taskflow.com)
    ├── DevOps — Rachel Green  (devops@taskflow.com)
    └── BizOps — Marcus Johnson  (bizops@taskflow.com)
```

---

## 📋 Feature Compliance

| Requirement | Status |
|------------|--------|
| User Authentication (Signup/Login) | ✅ |
| JWT + OTP email verification | ✅ |
| Role-based access (ADMIN/MANAGER/MEMBER) | ✅ |
| Project creation & management | ✅ |
| Task creation, assignment & status tracking | ✅ |
| Kanban board (drag-and-drop) | ✅ |
| Dashboard with analytics | ✅ |
| Overdue task detection | ✅ |
| REST API with proper validations | ✅ |
| PostgreSQL database with Prisma ORM | ✅ |
| Team management & org chart | ✅ |
| In-app notifications | ✅ |
| AI Agent (natural language commands) | ✅ |
| Deployed on Railway (live & functional) | ✅ |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
