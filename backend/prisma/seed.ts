import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TaskFlow Technologies — 12-person startup...\n');

  // Clear all existing data
  await prisma.activityLog.deleteMany();
  await prisma.agentSession.deleteMany();
  await prisma.task.deleteMany();
  await prisma.teamProject.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.roleRequest.deleteMany();
  await prisma.user.deleteMany();

  const pw = {
    admin:    await bcryptjs.hash('Admin@123', 10),
    manager:  await bcryptjs.hash('Manager@123', 10),
    employee: await bcryptjs.hash('Employee@123', 10),
    intern:   await bcryptjs.hash('Intern@123', 10),
  };

  // ────────────────────────────────────────────────────
  // PERSONAL ACCOUNT (always recreated)
  // ────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'ravegobburu@gmail.com',
      name: 'Rave Gobburu',
      password: pw.admin,
      globalRole: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Personal account: ravegobburu@gmail.com (ADMIN)');

  // ────────────────────────────────────────────────────
  // LEVEL 1 — CEO
  // ────────────────────────────────────────────────────
  const ceo = await prisma.user.create({
    data: {
      email: 'ceo@taskflow.com',
      name: 'Robert Chen',
      password: pw.admin,
      globalRole: 'ADMIN',
      isVerified: true,
    },
  });
  console.log(`✅ L1 CEO: ${ceo.name}`);

  // ────────────────────────────────────────────────────
  // LEVEL 2 — C-Suite / Department Heads
  // ────────────────────────────────────────────────────
  const cto = await prisma.user.create({
    data: { email: 'cto@taskflow.com', name: 'Sarah Anderson', password: pw.manager, globalRole: 'MANAGER', isVerified: true },
  });
  const headProduct = await prisma.user.create({
    data: { email: 'product-head@taskflow.com', name: 'Maria Garcia', password: pw.manager, globalRole: 'MANAGER', isVerified: true },
  });
  const opsManager = await prisma.user.create({
    data: { email: 'ops@taskflow.com', name: 'David Kumar', password: pw.manager, globalRole: 'MANAGER', isVerified: true },
  });
  console.log(`✅ L2 CTO: ${cto.name} | Head of Product: ${headProduct.name} | Ops Manager: ${opsManager.name}`);

  // ────────────────────────────────────────────────────
  // LEVEL 3 — Senior ICs / Team Leads
  // ────────────────────────────────────────────────────
  const seniorFE = await prisma.user.create({
    data: { email: 'fe-lead@taskflow.com', name: 'Alex Johnson', password: pw.manager, globalRole: 'MANAGER', isVerified: true },
  });
  const seniorBE = await prisma.user.create({
    data: { email: 'be-lead@taskflow.com', name: 'Emma Wilson', password: pw.manager, globalRole: 'MANAGER', isVerified: true },
  });
  const qaEngineer = await prisma.user.create({
    data: { email: 'qa@taskflow.com', name: 'Sophie Martin', password: pw.employee, globalRole: 'MEMBER', isVerified: true },
  });
  const productMgr = await prisma.user.create({
    data: { email: 'pm@taskflow.com', name: 'Jessica Park', password: pw.employee, globalRole: 'MEMBER', isVerified: true },
  });
  console.log(`✅ L3 Senior FE: ${seniorFE.name} | Senior BE: ${seniorBE.name} | QA: ${qaEngineer.name} | PM: ${productMgr.name}`);

  // ────────────────────────────────────────────────────
  // LEVEL 4 — Individual Contributors
  // ────────────────────────────────────────────────────
  const feDev = await prisma.user.create({
    data: { email: 'fe-dev@taskflow.com', name: 'James Mitchell', password: pw.employee, globalRole: 'MEMBER', isVerified: true },
  });
  const beDev = await prisma.user.create({
    data: { email: 'be-dev@taskflow.com', name: 'Michael Chen', password: pw.employee, globalRole: 'MEMBER', isVerified: true },
  });
  const devops = await prisma.user.create({
    data: { email: 'devops@taskflow.com', name: 'Rachel Green', password: pw.employee, globalRole: 'MEMBER', isVerified: true },
  });
  const bizops = await prisma.user.create({
    data: { email: 'bizops@taskflow.com', name: 'Marcus Johnson', password: pw.employee, globalRole: 'MEMBER', isVerified: true },
  });
  console.log(`✅ L4 FE Dev: ${feDev.name} | BE Dev: ${beDev.name} | DevOps: ${devops.name} | BizOps: ${bizops.name}`);

  // ────────────────────────────────────────────────────
  // LEVEL 5 — Intern
  // ────────────────────────────────────────────────────
  const intern = await prisma.user.create({
    data: { email: 'intern@taskflow.com', name: 'Lucas Rodriguez', password: pw.intern, globalRole: 'MEMBER', isVerified: true },
  });
  console.log(`✅ L5 Intern: ${intern.name}`);

  // ────────────────────────────────────────────────────
  // TEAMS
  // ────────────────────────────────────────────────────
  console.log('\n🏗  Creating teams...');

  const engTeam = await prisma.team.create({
    data: {
      name: 'Engineering',
      description: 'Frontend, Backend, QA and DevOps engineers building the product',
      department: 'Engineering',
      managerId: cto.id,
      members: {
        create: [
          { userId: cto.id,      role: 'LEAD', title: 'Chief Technology Officer', managerId: null },
          { userId: seniorFE.id, role: 'LEAD', title: 'Senior Frontend Developer', managerId: cto.id },
          { userId: seniorBE.id, role: 'LEAD', title: 'Senior Backend Developer',  managerId: cto.id },
          { userId: qaEngineer.id, role: 'IC', title: 'QA Engineer',               managerId: cto.id },
          { userId: feDev.id,    role: 'IC',   title: 'Frontend Developer',         managerId: seniorFE.id },
          { userId: beDev.id,    role: 'IC',   title: 'Backend Developer',          managerId: seniorBE.id },
          { userId: intern.id,   role: 'IC',   title: 'Software Engineering Intern',managerId: seniorFE.id },
        ],
      },
    },
  });

  const productTeam = await prisma.team.create({
    data: {
      name: 'Product',
      description: 'Product strategy, design and user research',
      department: 'Product',
      managerId: headProduct.id,
      members: {
        create: [
          { userId: headProduct.id, role: 'LEAD', title: 'Head of Product',  managerId: null },
          { userId: productMgr.id,  role: 'IC',   title: 'Product Manager',  managerId: headProduct.id },
        ],
      },
    },
  });

  const opsTeam = await prisma.team.create({
    data: {
      name: 'Operations',
      description: 'Infrastructure, DevOps and business operations',
      department: 'Operations',
      managerId: opsManager.id,
      members: {
        create: [
          { userId: opsManager.id, role: 'LEAD', title: 'Operations Manager', managerId: null },
          { userId: devops.id,     role: 'IC',   title: 'DevOps Engineer',    managerId: opsManager.id },
          { userId: bizops.id,     role: 'IC',   title: 'BizOps Analyst',     managerId: opsManager.id },
        ],
      },
    },
  });

  console.log(`✅ Engineering Team (7 members) | Product Team (2 members) | Operations Team (3 members)`);

  // ────────────────────────────────────────────────────
  // PROJECTS
  // ────────────────────────────────────────────────────
  console.log('\n📁 Creating projects...');

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign 2026',
      description: 'Complete overhaul of the public website with a modern, accessible design',
      createdBy: ceo.id,
      riskLevel: 'LOW',
      members: {
        create: [
          { userId: ceo.id,       role: 'ADMIN' },
          { userId: seniorFE.id,  role: 'MANAGER' },
          { userId: feDev.id,     role: 'MEMBER' },
          { userId: intern.id,    role: 'MEMBER' },
          { userId: productMgr.id,role: 'MEMBER' },
        ],
      },
    },
  });
  await prisma.teamProject.create({ data: { teamId: engTeam.id,     projectId: project1.id } });
  await prisma.teamProject.create({ data: { teamId: productTeam.id, projectId: project1.id } });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App — iOS & Android',
      description: 'Cross-platform mobile app using React Native, targeting Q3 release',
      createdBy: cto.id,
      riskLevel: 'MEDIUM',
      members: {
        create: [
          { userId: cto.id,       role: 'ADMIN' },
          { userId: seniorBE.id,  role: 'MANAGER' },
          { userId: seniorFE.id,  role: 'MANAGER' },
          { userId: beDev.id,     role: 'MEMBER' },
          { userId: feDev.id,     role: 'MEMBER' },
          { userId: qaEngineer.id,role: 'MEMBER' },
        ],
      },
    },
  });
  await prisma.teamProject.create({ data: { teamId: engTeam.id, projectId: project2.id } });

  const project3 = await prisma.project.create({
    data: {
      name: 'API Gateway & Infrastructure',
      description: 'Migrate from monolith to microservices with a new API gateway and CI/CD pipeline',
      createdBy: cto.id,
      riskLevel: 'HIGH',
      members: {
        create: [
          { userId: cto.id,       role: 'ADMIN' },
          { userId: seniorBE.id,  role: 'MANAGER' },
          { userId: opsManager.id,role: 'MANAGER' },
          { userId: beDev.id,     role: 'MEMBER' },
          { userId: devops.id,    role: 'MEMBER' },
          { userId: bizops.id,    role: 'MEMBER' },
        ],
      },
    },
  });
  await prisma.teamProject.create({ data: { teamId: engTeam.id, projectId: project3.id } });
  await prisma.teamProject.create({ data: { teamId: opsTeam.id,  projectId: project3.id } });

  console.log(`✅ Project 1: ${project1.name} (LOW)`);
  console.log(`✅ Project 2: ${project2.name} (MEDIUM)`);
  console.log(`✅ Project 3: ${project3.name} (HIGH)`);

  // ────────────────────────────────────────────────────
  // TASKS
  // ────────────────────────────────────────────────────
  console.log('\n📋 Creating tasks...');
  const d = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000);

  // Project 1 tasks
  const p1Tasks = [
    { title: 'Design new homepage mockup', description: 'Create hi-fi Figma mockup for the new homepage', status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', creatorId: seniorFE.id, assigneeId: productMgr.id, projectId: project1.id, dueDate: d(3) },
    { title: 'Implement navigation redesign', description: 'Build new responsive navigation bar with mobile menu', status: 'TODO', priority: 'HIGH', type: 'FEATURE', creatorId: seniorFE.id, assigneeId: feDev.id, projectId: project1.id, dueDate: d(7) },
    { title: 'Setup Tailwind CSS v4', description: 'Upgrade from v3 to v4 and migrate existing styles', status: 'DONE', priority: 'MEDIUM', type: 'IMPROVEMENT', creatorId: seniorFE.id, assigneeId: intern.id, projectId: project1.id, dueDate: d(-3) },
    { title: 'Write accessibility audit report', description: 'Run axe and WAVE audits, document WCAG 2.1 gaps', status: 'IN_REVIEW', priority: 'MEDIUM', type: 'IMPROVEMENT', creatorId: productMgr.id, assigneeId: intern.id, projectId: project1.id, dueDate: d(5) },
  ];

  // Project 2 tasks (some overdue)
  const p2Tasks = [
    { title: '🔴 CRITICAL: iOS login OAuth broken', description: 'Users cannot sign in on iOS 17+. Blocks QA testing.', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'BUG', creatorId: seniorBE.id, assigneeId: beDev.id, projectId: project2.id, dueDate: d(-2) },
    { title: '🔴 Android ANR on startup', description: 'App freezes for 3–5 seconds on Android 14 cold start', status: 'TODO', priority: 'HIGH', type: 'BUG', creatorId: cto.id, assigneeId: null, projectId: project2.id, dueDate: d(-1) },
    { title: 'Push notifications — Android', description: 'FCM integration for Android, deep link support', status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', creatorId: seniorBE.id, assigneeId: feDev.id, projectId: project2.id, dueDate: d(8) },
    { title: 'End-to-end QA regression suite', description: 'Automated E2E tests covering auth, task CRUD, notifications', status: 'TODO', priority: 'MEDIUM', type: 'FEATURE', creatorId: cto.id, assigneeId: qaEngineer.id, projectId: project2.id, dueDate: d(14) },
  ];

  // Project 3 tasks (HIGH RISK)
  const p3Tasks = [
    { title: '🚨 DB migration rollback incomplete', description: 'Production migration failed 3 days ago, rollback caused 2h downtime', status: 'IN_PROGRESS', priority: 'CRITICAL', type: 'BUG', creatorId: seniorBE.id, assigneeId: beDev.id, projectId: project3.id, dueDate: d(-3) },
    { title: 'Rate limiting middleware', description: 'Implement Redis-based rate limiting, 1000 req/min per API key', status: 'IN_PROGRESS', priority: 'HIGH', type: 'FEATURE', creatorId: opsManager.id, assigneeId: devops.id, projectId: project3.id, dueDate: d(-1) },
    { title: 'CI/CD pipeline for microservices', description: 'GitHub Actions → Docker → Railway deploy pipeline', status: 'IN_REVIEW', priority: 'HIGH', type: 'FEATURE', creatorId: opsManager.id, assigneeId: devops.id, projectId: project3.id, dueDate: d(4) },
    { title: 'OpenAPI 3.0 documentation', description: 'Document all gateway endpoints with request/response schemas', status: 'DONE', priority: 'MEDIUM', type: 'IMPROVEMENT', creatorId: seniorBE.id, assigneeId: bizops.id, projectId: project3.id, dueDate: d(-5) },
    { title: 'Load test — 10k concurrent users', description: 'Use k6 to validate gateway handles 10k concurrent requests', status: 'TODO', priority: 'HIGH', type: 'IMPROVEMENT', creatorId: cto.id, assigneeId: devops.id, projectId: project3.id, dueDate: d(10) },
  ];

  for (const t of [...p1Tasks, ...p2Tasks, ...p3Tasks]) {
    await prisma.task.create({ data: t });
  }
  console.log(`✅ ${p1Tasks.length + p2Tasks.length + p3Tasks.length} tasks created across 3 projects`);

  // ────────────────────────────────────────────────────
  // SUMMARY
  // ────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(65));
  console.log('🎉 SEED COMPLETE — TaskFlow Technologies');
  console.log('═'.repeat(65));
  console.log(`
ORGANIZATIONAL HIERARCHY (12 employees):
  
  CEO — Robert Chen  (ceo@taskflow.com / Admin@123)
  ├── CTO — Sarah Anderson  (cto@taskflow.com / Manager@123)
  │   ├── Sr. Frontend — Alex Johnson  (fe-lead@taskflow.com / Manager@123)
  │   │   ├── FE Dev — James Mitchell  (fe-dev@taskflow.com / Employee@123)
  │   │   └── Intern — Lucas Rodriguez  (intern@taskflow.com / Intern@123)
  │   ├── Sr. Backend — Emma Wilson  (be-lead@taskflow.com / Manager@123)
  │   │   └── BE Dev — Michael Chen  (be-dev@taskflow.com / Employee@123)
  │   └── QA Eng — Sophie Martin  (qa@taskflow.com / Employee@123)
  ├── Head of Product — Maria Garcia  (product-head@taskflow.com / Manager@123)
  │   └── PM — Jessica Park  (pm@taskflow.com / Employee@123)
  └── Ops Manager — David Kumar  (ops@taskflow.com / Manager@123)
      ├── DevOps — Rachel Green  (devops@taskflow.com / Employee@123)
      └── BizOps — Marcus Johnson  (bizops@taskflow.com / Employee@123)
  `);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
