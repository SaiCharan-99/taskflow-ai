import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';
import tasksRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import agentRoutes from './routes/agent';
import roleRequestsRoutes from './routes/roleRequests';
import teamsRoutes from './routes/teams';
import notificationsRoutes from './routes/notifications';
import { prisma } from './lib/prisma';
import { authMiddleware } from './middleware/auth';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow localhost (dev) + any Railway subdomain + whatever FRONTEND_URL is set to
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:8085',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }
    // Allow Railway domains and configured origins
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.railway.app') ||
      origin.endsWith('.up.railway.app')
    ) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Health check — must come BEFORE auth middleware ───────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/role-requests', roleRequestsRoutes);
app.use('/api/projects', authMiddleware, projectsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/agent', authMiddleware, agentRoutes);
app.use('/api/teams', authMiddleware, teamsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

// Tasks are sub-resources of projects: /:projectId/tasks
app.use('/api/projects', authMiddleware, tasksRoutes);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0'; // Required for Railway — do NOT use localhost

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   DB: ${process.env.DATABASE_URL ? 'connected' : '⚠️  DATABASE_URL not set'}`);
});

export { prisma, app };
