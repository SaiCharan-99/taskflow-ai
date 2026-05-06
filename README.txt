TaskFlow AI

TaskFlow AI is a full-stack project and task management application with role-based access control.

What the app does
- Users can sign up, log in, and verify their accounts with OTP.
- Admins and members can work inside projects and tasks.
- Projects support team assignment and progress tracking.
- Tasks support creation, assignment, priority, status changes, and overdue tracking.
- Dashboards show totals, progress, overdue work, and risk level.

Main stack
- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: Prisma with SQLite for development
- Authentication: JWT and OTP verification
- Access control: Admin and Member roles

How to run
1. Start the backend
   cd backend
   npm install
   npm run db:migrate
   npm run dev

2. Start the frontend
   cd frontend
   npm install
   npm run dev

3. Open the app
   http://localhost:8080

Important API notes
- REST APIs are used for auth, projects, tasks, dashboard, and role requests.
- Protected routes require an Authorization header with a Bearer token.
- The backend is configured through backend/.env.

Test data
- The project includes seeded users, projects, and tasks for testing.
- The data includes admins, managers, employees, overdue tasks, and risk scenarios.

Repository layout
- backend: Express API and Prisma schema
- frontend: React UI
- README.txt: main project overview
- requirements.txt: project requirements checklist
