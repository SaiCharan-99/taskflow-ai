import express, { Response } from 'express';
import { AuthRequest, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (value?: Date | string | null) => {
  if (!value) return 'no due date';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString();
};

const buildProjectSnapshot = async (projectId: string) => {
  const [project, members, tasks] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId }, include: { members: { include: { user: true } } } }),
    prisma.projectMember.findMany({ where: { projectId }, include: { user: true } }),
    prisma.task.findMany({ where: { projectId }, include: { assignee: true, creator: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  return { project, members, tasks };
};

const parseDatePhrase = (phrase: string): Date | null => {
  const lower = phrase.toLowerCase();
  const now = new Date();
  if (lower.includes('tomorrow')) return new Date(now.getTime() + 86400000);
  if (lower.includes('next week')) return new Date(now.getTime() + 7 * 86400000);
  if (lower.includes('in 3 days')) return new Date(now.getTime() + 3 * 86400000);
  if (lower.includes('in 5 days')) return new Date(now.getTime() + 5 * 86400000);
  if (lower.includes('in 2 weeks')) return new Date(now.getTime() + 14 * 86400000);
  const parsed = new Date(phrase);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Detects if the message is a "create project" intent.
 * Handles patterns like:
 *   "create project TaskFlow"
 *   "create a new project called UI/UX Enhancements"
 *   "CREATE A NEW PROJECT TASK FLOW DESCRIPTION: UI/UX ENHANCEMENTS"
 *   "new project: Marketing Campaign description: run Q4 ads"
 */
const isCreateProjectIntent = (lower: string) =>
  (lower.includes('create') || lower.includes('new') || lower.includes('add') || lower.includes('make')) &&
  lower.includes('project');

/**
 * Extract project name and description from a natural-language message.
 * Strategy: try several regex patterns from most-specific to least-specific.
 */
const extractProjectDetails = (message: string): { name: string; description: string } => {
  // Pattern 1: "called/named X description Y" or "called/named X"
  const calledMatch = message.match(/(?:called|named)\s+["']?(.+?)["']?(?:\s+description\s*[:\-]?\s*(.+?))?$/i);
  if (calledMatch) {
    return {
      name: calledMatch[1].trim(),
      description: calledMatch[2]?.trim() || '',
    };
  }

  // Pattern 2: "project: Name description: Desc" or "project Name description: Desc"
  const withDescMatch = message.match(
    /project[:\s]+["']?(.+?)["']?(?:\s+description\s*[:\-]\s*(.+?))?$/i
  );
  if (withDescMatch) {
    // If there's a description keyword in the capture, split on it
    const rawName = withDescMatch[1].trim();
    const descFromCapture = withDescMatch[2]?.trim();

    // Check if "description" keyword appears in rawName (e.g. "TASK FLOW DESCRIPTION : UI/UX ENHANCEMENTS")
    const innerDescMatch = rawName.match(/^(.+?)\s+description\s*[:\-]?\s*(.+)$/i);
    if (innerDescMatch) {
      return {
        name: innerDescMatch[1].trim(),
        description: innerDescMatch[2].trim(),
      };
    }

    return {
      name: rawName,
      description: descFromCapture || '',
    };
  }

  // Pattern 3: Fallback — strip known command words and use what's left as name
  const stripped = message
    .replace(/create|add|new|make|a\s+new|the|project/gi, '')
    .replace(/description\s*[:\-]?\s*.+$/i, '')
    .replace(/with\s+risk\s+(high|medium|low)/i, '')
    .trim();

  return {
    name: stripped || 'New Project',
    description: '',
  };
};

// ─── Intent: Create Project ───────────────────────────────────────────────────
const tryCreateProject = async (message: string, userId: string) => {
  const lower = message.toLowerCase();
  if (!isCreateProjectIntent(lower)) return null;

  const { name, description } = extractProjectDetails(message);

  const riskMatch = message.match(/\b(high|medium|low)\s+risk\b|\brisk\s*[:\-]?\s*(high|medium|low)\b/i);
  const riskRaw = riskMatch?.[1] ?? riskMatch?.[2] ?? 'LOW';
  const riskLevel = (['HIGH', 'MEDIUM', 'LOW'].includes(riskRaw.toUpperCase())
    ? riskRaw.toUpperCase()
    : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW';

  const project = await prisma.project.create({
    data: {
      name,
      description: description || `Created via AI Agent`,
      createdBy: userId,
      riskLevel,
      members: { create: [{ userId, role: 'ADMIN' }] },
    },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      projectId: project.id,
      action: 'PROJECT_CREATED',
      meta: `AI Agent created project: "${project.name}"`,
    },
  });

  return {
    role: 'assistant' as const,
    content: `✅ **Project created successfully!**\n\n**"${project.name}"**\n${description ? `- Description: ${description}\n` : ''}- Risk: ${riskLevel}\n- You've been added as Admin\n\nGo to **Projects** to start adding tasks and team members.`,
    toolResult: {
      type: 'project_created' as const,
      data: { id: project.id, name: project.name, riskLevel, description },
    },
  };
};

/**
 * Detects if the message is a "create task" intent.
 */
const isCreateTaskIntent = (lower: string) =>
  lower.includes('create task') ||
  lower.includes('add task') ||
  lower.includes('new task') ||
  lower.includes('create a task') ||
  lower.includes('add a task');

/**
 * Extract task title from natural language.
 * Handles: "create task Fix login bug", "add task: Update readme due next week assign James"
 */
const extractTaskTitle = (message: string): string => {
  // Try "task [title]" pattern stopping at known keyword boundaries
  const match = message.match(
    /(?:create|add|new)\s+(?:a\s+)?task[:\s]+(.+?)(?:\s+(?:due|assign(?:ed)?(?:\s+to)?|priority|for|with)\b|$)/i
  );
  if (match?.[1]?.trim()) return match[1].trim();

  // Fallback: strip command words
  return message
    .replace(/create|add|new|a\s+|task/gi, '')
    .replace(/due\s+.+$/i, '')
    .replace(/assign(?:ed)?\s+to\s+\w+/i, '')
    .trim()
    .substring(0, 80) || 'New Task';
};

// ─── Intent: Create Task ─────────────────────────────────────────────────────
const tryCreateTask = async (
  message: string,
  projectId: string,
  userId: string,
  members: { userId: string; user: { name: string; email: string } }[]
) => {
  const lower = message.toLowerCase();
  if (!isCreateTaskIntent(lower)) return null;

  const title = extractTaskTitle(message);

  // Extract due date
  const dueMatch = message.match(/due\s+(.+?)(?:\s+assign|\s+priority|$)/i);
  const dueDate = dueMatch ? parseDatePhrase(dueMatch[1]) : new Date(Date.now() + 7 * 86400000);

  // Extract assignee by name or pick lightest load
  const assignMatch = message.match(/assign(?:ed)?\s+(?:to\s+)?([a-z]+)/i);
  let assigneeId: string | null = null;
  if (assignMatch) {
    const name = assignMatch[1].toLowerCase();
    const match = members.find((m) => m.user.name.toLowerCase().includes(name));
    if (match) assigneeId = match.userId;
  }
  if (!assigneeId && members.length > 0) {
    const counts = await Promise.all(
      members.map(async (m) => ({
        userId: m.userId,
        count: await prisma.task.count({ where: { projectId, assigneeId: m.userId } }),
      }))
    );
    const lightest = counts.sort((a, b) => a.count - b.count)[0];
    assigneeId = lightest?.userId ?? null;
  }

  // Extract priority
  const priorityMatch = message.match(/\b(critical|high|medium|low)\b/i);
  const priority = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(
    priorityMatch?.[1]?.toUpperCase() ?? ''
  )
    ? priorityMatch![1].toUpperCase()
    : 'MEDIUM') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  // Extract type
  const typeMatch = message.match(/\b(bug|feature|improvement)\b/i);
  const type = (['BUG', 'FEATURE', 'IMPROVEMENT'].includes(typeMatch?.[1]?.toUpperCase() ?? '')
    ? typeMatch![1].toUpperCase()
    : 'FEATURE') as 'BUG' | 'FEATURE' | 'IMPROVEMENT';

  const task = await prisma.task.create({
    data: {
      title,
      description: `Created via AI Agent`,
      status: 'TODO',
      priority,
      type,
      projectId,
      creatorId: userId,
      assigneeId,
      dueDate,
    },
    include: { assignee: true },
  });

  await prisma.activityLog.create({
    data: {
      projectId,
      userId,
      action: 'TASK_CREATED',
      meta: `AI Agent created task: "${task.title}"`,
    },
  });

  // Notify assignee
  if (assigneeId && assigneeId !== userId) {
    await prisma.notification.create({
      data: {
        userId: assigneeId,
        title: 'New task assigned to you',
        message: `AI Agent assigned you "${title}"`,
        type: 'task_assigned',
        link: `/projects/${projectId}/board`,
        taskId: task.id,
        projectId,
      },
    });
  }

  const assigneeName = task.assignee?.name ?? 'Unassigned';
  return {
    role: 'assistant' as const,
    content: `✅ **Task created successfully!**\n\n**"${task.title}"**\n- Priority: ${priority}\n- Type: ${type}\n- Assigned to: ${assigneeName}\n- Due: ${formatDate(dueDate)}\n- Status: To Do\n\nView it on the board or tasks page.`,
    toolResult: {
      type: 'task_created' as const,
      data: { id: task.id, title: task.title, assignee: assigneeName, priority, dueDate, status: 'TODO' },
    },
  };
};

// ─── Gemini AI ────────────────────────────────────────────────────────────────
const processWithGemini = async (
  message: string,
  projectId: string,
  history: { role: string; content: string }[]
): Promise<{ role: 'assistant'; content: string; toolResult?: any } | null> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { project, members, tasks } = await buildProjectSnapshot(projectId);
    if (!project) return null;

    const now = new Date();
    const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
    const statusSummary = {
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    };
    const completionRate = tasks.length > 0 ? Math.round((statusSummary.done / tasks.length) * 100) : 0;

    const systemPrompt = `You are TaskFlow AI, an intelligent project management assistant for ADMIN users.
You have real-time access to this project's data and can CREATE tasks and projects.

PROJECT: ${project.name}
Description: ${project.description || 'No description'}
Risk: ${project.riskLevel}

TASKS (${tasks.length} total): Todo=${statusSummary.todo} | In Progress=${statusSummary.inProgress} | In Review=${statusSummary.inReview} | Done=${statusSummary.done}
Completion rate: ${completionRate}% | Overdue: ${overdueTasks.length}

OVERDUE:
${overdueTasks.length ? overdueTasks.map((t) => `- "${t.title}" (${t.priority}, ${t.assignee?.name || 'unassigned'}, due ${formatDate(t.dueDate)})`).join('\n') : '- None'}

ALL TASKS:
${tasks.slice(0, 15).map((t) => `- [${t.status}] "${t.title}" | ${t.priority} | ${t.assignee?.name || 'unassigned'} | due ${formatDate(t.dueDate)}`).join('\n')}

TEAM:
${members.map((m) => {
  const n = tasks.filter((t) => t.assigneeId === m.userId).length;
  const od = tasks.filter((t) => t.assigneeId === m.userId && t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;
  return `- ${m.user.name} (${m.role}): ${n} tasks, ${od} overdue`;
}).join('\n')}

CAPABILITIES:
- Answer questions about tasks, members, progress
- To CREATE a task: say "create task [title]" and optionally add "due [date]", "assign [name]", "[priority]"
- To CREATE a project: say "create project [name] description: [description]"
- Keep answers concise with bullet points. Max 250 words.`;

    const geminiHistory = history
      .slice(-6)
      .map((h) => ({
        role: h.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: h.content }],
      }));

    const chat = model.startChat({ history: geminiHistory, systemInstruction: systemPrompt });
    const result = await chat.sendMessage(message);

    return { role: 'assistant', content: result.response.text() };
  } catch (err) {
    console.error('Gemini error:', err);
    return null;
  }
};

// ─── Rules Fallback ───────────────────────────────────────────────────────────
const processWithRulesEngine = async (
  message: string,
  projectId: string
): Promise<{ role: 'assistant'; content: string; toolResult?: any }> => {
  const lower = message.toLowerCase();
  const { project, members, tasks } = await buildProjectSnapshot(projectId);

  if (!project) return { role: 'assistant', content: 'Project not found. Please refresh and try again.' };

  const now = new Date();
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE');
  const unassigned = tasks.filter((t) => !t.assigneeId);
  const statusSummary = {
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  if (lower.includes('overdue') || lower.includes('late')) {
    return {
      role: 'assistant',
      content: [`**${overdueTasks.length} overdue task(s)** in ${project.name}:`, ...overdueTasks.slice(0, 5).map((t) => `- "${t.title}" → ${t.assignee?.name || 'unassigned'}, due ${formatDate(t.dueDate)}`)].join('\n'),
      toolResult: { type: 'task_list', data: overdueTasks },
    };
  }

  if (lower.includes('workload') || lower.includes('who is busy') || lower.includes('who has')) {
    const workload = members.map((m) => ({
      name: m.user.name,
      total: tasks.filter((t) => t.assigneeId === m.userId).length,
      overdue: tasks.filter((t) => t.assigneeId === m.userId && t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length,
    }));
    return {
      role: 'assistant',
      content: [`**Workload — ${project.name}:**`, ...workload.map((w) => `- ${w.name}: ${w.total} tasks, ${w.overdue} overdue`)].join('\n'),
      toolResult: { type: 'workload_summary', data: workload },
    };
  }

  if (lower.includes('status') || lower.includes('progress') || lower.includes('summary')) {
    const rate = tasks.length > 0 ? Math.round((statusSummary.done / tasks.length) * 100) : 0;
    return {
      role: 'assistant',
      content: [`**${project.name} — Status Summary**`, `- Todo: ${statusSummary.todo}`, `- In Progress: ${statusSummary.inProgress}`, `- In Review: ${statusSummary.inReview}`, `- Done: ${statusSummary.done}`, `- Completion: ${rate}%`, `- Overdue: ${overdueTasks.length}`, `- Unassigned: ${unassigned.length}`].join('\n'),
      toolResult: { type: 'status_updated', data: { ...statusSummary, overdue: overdueTasks.length, unassigned: unassigned.length, completionRate: rate } },
    };
  }

  return {
    role: 'assistant',
    content: [
      `I can help with **${project.name}**. Try:`,
      `- "What tasks are overdue?"`,
      `- "Show workload summary"`,
      `- "Show project status"`,
      `- "Create task Fix login bug due next week assign James high priority"`,
      `- "Create project Marketing Campaign description: Run Q4 ad campaigns"`,
      `\n*Current:* ${tasks.length} tasks, ${overdueTasks.length} overdue, ${unassigned.length} unassigned`,
    ].join('\n'),
  };
};

// ─── POST /chat ───────────────────────────────────────────────────────────────
router.post('/chat', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, message, history } = req.body;
    if (!projectId || !message) return res.status(400).json({ error: 'projectId and message are required' });

    // ── Action intents run FIRST before Gemini so they always write to DB ──

    // 1. Create project intent (check before task since "create project" > "create task")
    const projectResult = await tryCreateProject(message, req.userId!);
    if (projectResult) {
      res.json(projectResult);
      return;
    }

    // 2. Create task intent
    const { members } = await buildProjectSnapshot(projectId);
    const taskResult = await tryCreateTask(message, projectId, req.userId!, members as any);
    if (taskResult) {
      res.json(taskResult);
      return;
    }

    // 3. Non-mutating: try Gemini, fall back to rules engine
    const agentResponse =
      (await processWithGemini(message, projectId, history || [])) ||
      (await processWithRulesEngine(message, projectId));

    // Persist session
    const sessionMessages = [...(history || []), { role: 'user', content: message }, agentResponse];
    const session = await prisma.agentSession.findFirst({ where: { projectId, userId: req.userId } });
    if (session) {
      await prisma.agentSession.update({ where: { id: session.id }, data: { messages: JSON.stringify(sessionMessages) } });
    } else {
      await prisma.agentSession.create({ data: { projectId, userId: req.userId!, messages: JSON.stringify(sessionMessages) } });
    }

    res.json(agentResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Agent chat failed' });
  }
});

// ─── POST /confirm ────────────────────────────────────────────────────────────
router.post('/confirm', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    res.json({ role: 'assistant', content: 'Action confirmed.', toolResult: { type: 'action_confirmed', data: req.body } });
  } catch (error) {
    res.status(500).json({ error: 'Confirmation failed' });
  }
});

export default router;
