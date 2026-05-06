import 'dotenv/config';
import { execSync } from 'child_process';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import agentRoutes from './routes/agent.js';
import roleRequestsRoutes from './routes/roleRequests.js';
import teamsRoutes from './routes/teams.js';
import notificationsRoutes from './routes/notifications.js';
import { prisma } from './lib/prisma.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/role-requests', roleRequestsRoutes);
app.use('/api/projects', authMiddleware, projectsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/agent', authMiddleware, agentRoutes);
app.use('/api/teams', authMiddleware, teamsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);
// Tasks are sub-resources of projects — same prefix, no conflict
app.use('/api/projects', authMiddleware, tasksRoutes);

// ─── Health check (Railway pings this) ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

// IMPORTANT: Bind the HTTP server FIRST so Railway's healthcheck gets a response
// immediately. Prisma migrations run synchronously after the server is up.
// If migrations fail we log the error but keep running — the DB is likely already
// up-to-date on re-deploys.
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);

  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🔄 Running database migrations...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations complete');
    } catch (err) {
      console.error('⚠️  Migration error (non-fatal, server still running):', err);
    }
  }
});

export { prisma, app };
