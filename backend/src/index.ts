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

// Middleware
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
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/role-requests', roleRequestsRoutes);
app.use('/api/projects', authMiddleware, projectsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/agent', authMiddleware, agentRoutes);
app.use('/api/teams', authMiddleware, teamsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

// Tasks routes are intentionally mounted at the same /api/projects prefix as projectsRoutes.
// They are sub-resources: /:projectId/tasks, /:projectId/tasks/:taskId
// Route patterns don't conflict because tasks paths are longer and require /tasks segment.
app.use('/api/projects', authMiddleware, tasksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export { prisma, app };
