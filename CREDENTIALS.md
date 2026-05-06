# 🔑 TaskFlow AI — Login Credentials (12 Employees)

> **All accounts are pre-verified** — no OTP required in seed data.

---

## 🏢 Organizational Hierarchy

```
TaskFlow Technologies
│
CEO — Robert Chen
├── CTO — Sarah Anderson
│   ├── Sr. Frontend Dev — Alex Johnson
│   │   ├── Frontend Dev — James Mitchell
│   │   └── Intern — Lucas Rodriguez
│   ├── Sr. Backend Dev — Emma Wilson
│   │   └── Backend Dev — Michael Chen
│   └── QA Engineer — Sophie Martin
├── Head of Product — Maria Garcia
│   └── Product Manager — Jessica Park
└── Operations Manager — David Kumar
    ├── DevOps Engineer — Rachel Green
    └── BizOps Analyst — Marcus Johnson
```

---

## 👤 All 12 Employee Credentials

### 🔴 ADMIN (Full Access)

| # | Name | Email | Password | Title | Global Role |
|---|------|-------|----------|-------|-------------|
| 1 | **Robert Chen** | `ceo@taskflow.com` | `Admin@123` | CEO | ADMIN |

---

### 🟡 MANAGERS (Can create projects & tasks, manage teams)

| # | Name | Email | Password | Title | Reports To |
|---|------|-------|----------|-------|------------|
| 2 | **Sarah Anderson** | `cto@taskflow.com` | `Manager@123` | CTO | Robert Chen |
| 3 | **Maria Garcia** | `product-head@taskflow.com` | `Manager@123` | Head of Product | Robert Chen |
| 4 | **David Kumar** | `ops@taskflow.com` | `Manager@123` | Operations Manager | Robert Chen |
| 5 | **Alex Johnson** | `fe-lead@taskflow.com` | `Manager@123` | Sr. Frontend Developer | Sarah Anderson |
| 6 | **Emma Wilson** | `be-lead@taskflow.com` | `Manager@123` | Sr. Backend Developer | Sarah Anderson |

---

### 🟢 MEMBERS (View & work on assigned tasks)

| # | Name | Email | Password | Title | Reports To |
|---|------|-------|----------|-------|------------|
| 7 | **Sophie Martin** | `qa@taskflow.com` | `Employee@123` | QA Engineer | Sarah Anderson |
| 8 | **Jessica Park** | `pm@taskflow.com` | `Employee@123` | Product Manager | Maria Garcia |
| 9 | **James Mitchell** | `fe-dev@taskflow.com` | `Employee@123` | Frontend Developer | Alex Johnson |
| 10 | **Michael Chen** | `be-dev@taskflow.com` | `Employee@123` | Backend Developer | Emma Wilson |
| 11 | **Rachel Green** | `devops@taskflow.com` | `Employee@123` | DevOps Engineer | David Kumar |
| 12 | **Marcus Johnson** | `bizops@taskflow.com` | `Employee@123` | BizOps Analyst | David Kumar |

> **Lucas Rodriguez** (`intern@taskflow.com` / `Intern@123`) — Software Engineering Intern (MEMBER), reports to Alex Johnson.
> This brings the total seeded users to **13** (12 employees + 1 intern).

---

## 🚀 Quick Login by Use Case

### Test Full Admin Access
```
Email:    ceo@taskflow.com
Password: Admin@123
```
> Can: create/delete projects, add members, create tasks, use AI Agent, view all data.

### Test Manager Access
```
Email:    cto@taskflow.com
Password: Manager@123
```
> Can: create projects & tasks, manage team members, view dashboards.

### Test Employee / Member Access
```
Email:    fe-dev@taskflow.com
Password: Employee@123
```
> Can: view projects they're a member of, view & update assigned tasks. Cannot create projects.

### Test QA / Junior Member
```
Email:    qa@taskflow.com
Password: Employee@123
```
> Can: view assigned tasks, move tasks between statuses.

---

## 📋 Project Membership

### Project 1 — Website Redesign 2026 `LOW RISK`
| Member | Role in Project |
|--------|----------------|
| Robert Chen | ADMIN |
| Alex Johnson | MANAGER |
| James Mitchell | MEMBER |
| Lucas Rodriguez | MEMBER |
| Jessica Park | MEMBER |

### Project 2 — Mobile App — iOS & Android `MEDIUM RISK`
| Member | Role in Project |
|--------|----------------|
| Sarah Anderson | ADMIN |
| Emma Wilson | MANAGER |
| Alex Johnson | MANAGER |
| Michael Chen | MEMBER |
| James Mitchell | MEMBER |
| Sophie Martin | MEMBER |

### Project 3 — API Gateway & Infrastructure `HIGH RISK`
| Member | Role in Project |
|--------|----------------|
| Sarah Anderson | ADMIN |
| Emma Wilson | MANAGER |
| David Kumar | MANAGER |
| Michael Chen | MEMBER |
| Rachel Green | MEMBER |
| Marcus Johnson | MEMBER |

---

## 📊 Team Membership

### Engineering Team (7 members) — Manager: Sarah Anderson
| Member | Role | Title |
|--------|------|-------|
| Sarah Anderson | LEAD | Chief Technology Officer |
| Alex Johnson | LEAD | Senior Frontend Developer |
| Emma Wilson | LEAD | Senior Backend Developer |
| Sophie Martin | IC | QA Engineer |
| James Mitchell | IC | Frontend Developer |
| Michael Chen | IC | Backend Developer |
| Lucas Rodriguez | IC | Software Engineering Intern |

### Product Team (2 members) — Manager: Maria Garcia
| Member | Role | Title |
|--------|------|-------|
| Maria Garcia | LEAD | Head of Product |
| Jessica Park | IC | Product Manager |

### Operations Team (3 members) — Manager: David Kumar
| Member | Role | Title |
|--------|------|-------|
| David Kumar | LEAD | Operations Manager |
| Rachel Green | IC | DevOps Engineer |
| Marcus Johnson | IC | BizOps Analyst |

---

## ⚙️ Personal Developer Account

| Email | Password | Role |
|-------|----------|------|
| `ravegobburu@gmail.com` | `Admin@123` | ADMIN |

> This account is always re-created on seed and has full admin access.

---

## 🔄 Re-seed Database

To reset all data and restore these credentials:
```powershell
cd backend
npx prisma db seed
```

> ⚠️ This **wipes all existing data** including any projects/tasks created via the UI or AI Agent.
