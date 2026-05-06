<div align="center">

# 🚀 TaskFlow AI

### AI-Native Team Task Management Platform

**Full-stack project management tool with role-based access, real-time dashboards, and an AI assistant powered by Google Gemini**

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)](https://prisma.io)
[![Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app)

[**Live Demo →**](https://your-railway-url.up.railway.app) &nbsp;·&nbsp; [**API Docs →**](#api-endpoints) &nbsp;·&nbsp; [**Demo Video →**](#demo)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started (Local)](#getting-started-local)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control](#role-based-access-control)
- [Test Credentials](#test-credentials)
- [Deployment (Railway)](#deployment-railway)
- [Demo](#demo)

---

## Overview

TaskFlow AI is a full-stack project management web application built for teams. It combines the familiar Kanban-style task tracking with an embedded AI assistant (Google Gemini) that can answer questions, create tasks, and create projects via natural language.

**Problem Statement:** Build a web app where users can create projects, assign tasks, and track progress with role-based access (Admin/Member).

---

## Features

### ✅ Core Requirements
- **Authentication** — Signup, Login, Email OTP verification, JWT sessions
- **Project Management** — Create, update, delete projects; add/remove members
- **Task Management** — Create tasks, assign to members, set priority & due dates
- **Status Tracking** — `TODO → IN_PROGRESS → IN_REVIEW → DONE` with drag-and-drop Kanban board
- **Dashboard** — Live metrics: total, completed, in-progress, overdue tasks + workload chart
- **Role-Based Access Control** — Global roles (Admin/Manager/Member) + project-level roles
- **REST API** — Full backend with Prisma ORM + PostgreSQL
- **Validations** — Input validation, RBAC guards, relationship checks on all routes

### 🌟 Beyond Requirements
- **AI Agent** — Natural language commands: _"Create task Fix login bug due next week high priority"_
- **Team Hierarchy** — Org chart with departments, team leads, reporting lines
- **Notifications** — In-app notifications for task assignments and role changes
- **Role Request Workflow** — Members can request role upgrades; Admins approve/reject
- **Activity Log** — Every action tracked per project
- **Risk Assessment** — Project risk levels (LOW / MEDIUM / HIGH) with AI insights
- **Responsive Design** — Works on desktop and tablet

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Framer Motion |
| **UI Components** | Radix UI, shadcn/ui, Tailwind CSS, Lucide Icons |
| **State Management** | React Context + TanStack Query |
| **Charts** | Recharts |
| **Drag & Drop** | @hello-pangea/dnd |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Email** | Nodemailer + Gmail SMTP (OTP delivery) |
| **AI** | Google Gemini 1.5 Flash |
| **Deployment** | Railway (Backend + Frontend + PostgreSQL) |

---

## Architecture

```
taskflow-ai-main/
├── backend/                    # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # SQL migration history
│   │   └── seed.ts             # 12-employee seed data
│   └── src/
│       ├── index.ts            # Server entry point
│       ├── middleware/
│       │   └── auth.ts         # JWT + requireAdmin middleware
│       ├── routes/
│       │   ├── auth.ts         # Signup, Login, OTP, Me
│       │   ├── projects.ts     # Project CRUD + members
│       │   ├── tasks.ts        # Task CRUD per project
│       │   ├── dashboard.ts    # Analytics endpoint
│       │   ├── teams.ts        # Org hierarchy + team management
│       │   ├── agent.ts        # AI chat endpoint (Gemini)
│       │   ├── notifications.ts
│       │   └── roleRequests.ts
│       └── utils/
│           └── helpers.ts
│
└── frontend/                   # React + Vite SPA
    └── src/
        ├── api/                # Axios client + API modules
        ├── components/         # Reusable UI components
        │   ├── agent/          # AI chat drawer
        │   ├── dashboard/      # Metrics, charts, activity feed
        │   ├── kanban/         # Drag-and-drop board
        │   ├── layout/         # Sidebar, TopBar, AppLayout
        │   └── teams/          # Org chart, member lists
        ├── context/            # AuthContext, ProjectContext
        ├── hooks/              # useDashboard, useAgent
        └── pages/              # Route-level page components
```

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud)
- Gmail account with App Password (for OTP emails)
- Google Gemini API key (optional — for AI features)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow-ai.git
cd taskflow-ai
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Run database migrations
npx prisma migrate dev

# Seed with 12 test employees
npx prisma db seed

# Start development server
npm run dev
# → API running at http://localhost:3001
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
# → App running at http://localhost:8080
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Gmail SMTP (for OTP verification emails)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# Google Gemini AI (optional - for AI assistant)
GEMINI_API_KEY="your-gemini-api-key"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:8080"

# Server port
PORT=3001
```

### Frontend (`frontend/.env.local`)
```env
VITE_API_URL=http://localhost:3001
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| POST | `/api/auth/verify-otp` | Public | Verify email OTP |
| GET | `/api/auth/me` | Auth | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Auth | List projects (RBAC filtered) |
| POST | `/api/projects` | Admin/Manager | Create project |
| PATCH | `/api/projects/:id` | Project Admin | Update project |
| DELETE | `/api/projects/:id` | Creator | Delete project |
| GET | `/api/projects/:id/members` | Auth | List project members |
| POST | `/api/projects/:id/members` | Project Admin | Add member by email |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects/:id/tasks` | Project Member | List tasks |
| POST | `/api/projects/:id/tasks` | Admin/Manager | Create task |
| PATCH | `/api/projects/:id/tasks/:taskId` | Project Member | Update task |
| DELETE | `/api/projects/:id/tasks/:taskId` | Project Member | Delete task |

### Dashboard & Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/:projectId` | Project analytics |
| GET | `/api/teams/hierarchy/tree` | Full org chart |
| GET | `/api/teams/reports/direct` | Your direct reports |
| GET | `/api/teams/:id/workload` | Team workload |

### AI Agent
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/agent/chat` | Admin | Send message to AI |

---

## Role-Based Access Control

### Global Roles
| Role | Can Do |
|------|--------|
| **ADMIN** | Everything — all projects, AI agent, admin panel, delete anything |
| **MANAGER** | Create projects & tasks, manage team members, view all data |
| **MEMBER** | View & update tasks on projects they're a member of |

### Project-Level Roles
| Role | Permissions within a project |
|------|------------------------------|
| **ADMIN** | Update/delete project, add/remove members |
| **MANAGER** | Create & assign tasks |
| **MEMBER** | View tasks, move status |

---

## Test Credentials

The database is seeded with a realistic 12-person company:

### 🔴 Admin (Full Access)
```
Email:    ceo@taskflow.com
Password: Admin@123
```

### 🟡 Manager (Create Projects & Tasks)
```
Email:    cto@taskflow.com
Password: Manager@123
```

### 🟢 Member (View & Work on Assigned Tasks)
```
Email:    fe-dev@taskflow.com
Password: Employee@123
```

> See [CREDENTIALS.md](./CREDENTIALS.md) for all 12 employee accounts.

---

## Deployment (Railway)

This app is deployed on Railway with 3 services:
1. **PostgreSQL** — Managed database
2. **Backend** — Express API (auto-migrates on deploy)
3. **Frontend** — Vite static build served by `serve`

### Backend Environment Variables (Railway)
```
DATABASE_URL        → Copied from Railway Postgres service
JWT_SECRET          → Random 64-char string
GEMINI_API_KEY      → Your Google AI Studio key
GMAIL_USER          → Gmail address for OTP emails
GMAIL_APP_PASSWORD  → Gmail App Password
FRONTEND_URL        → Your Railway frontend URL
```

### Frontend Environment Variables (Railway)
```
VITE_API_URL → Your Railway backend URL (e.g. https://taskflow-backend.up.railway.app)
```

---

## Demo

> 📹 **[Watch the 2-minute demo video →](#)**

### What the demo covers:
1. **Login** as Admin (Robert Chen)
2. **Projects page** — view all 3 projects with risk levels
3. **Kanban board** — drag tasks between columns
4. **Dashboard** — live metrics, workload chart, activity feed
5. **AI Agent** — create a project and task via natural language
6. **Teams page** — org hierarchy, member profiles
7. **Project Settings** — add members, danger zone

---

## License

MIT — free to use, modify, and distribute.

---

