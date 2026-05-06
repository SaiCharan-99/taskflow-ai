import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with realistic test data...\n');

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.roleRequest.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcryptjs.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@taskflow.com',
      name: 'Sarah Anderson',
      password: adminPassword,
      globalRole: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email, '-', admin.name);

  // Create manager users with descriptive names
  const managerPassword = await bcryptjs.hash('Manager@123', 10);
  const managerNames = ['Alex Johnson (Frontend Lead)', 'Maria Garcia (Backend Lead)', 'David Chen (DevOps Lead)'];
  const managers = [];
  for (let i = 0; i < 3; i++) {
    const manager = await prisma.user.create({
      data: {
        email: `manager${i + 1}@taskflow.com`,
        name: managerNames[i],
        password: managerPassword,
        globalRole: 'MANAGER',
        isVerified: true,
      },
    });
    managers.push(manager);
    console.log(`✅ Manager created:`, manager.email, '-', manager.name);
  }

  // Create employee users with realistic names
  const employeePassword = await bcryptjs.hash('Employee@123', 10);
  const employeeNames = [
    'James Wilson',
    'Emma Brown',
    'Michael Davis',
    'Sophie Martin',
    'Oliver Taylor',
    'Olivia Rodriguez',
    'Lucas Thompson',
  ];
  const employees = [];
  for (let i = 0; i < 7; i++) {
    const employee = await prisma.user.create({
      data: {
        email: `employee${i + 1}@taskflow.com`,
        name: employeeNames[i],
        password: employeePassword,
        globalRole: 'MEMBER',
        isVerified: true,
      },
    });
    employees.push(employee);
    console.log(`✅ Employee created:`, employee.email, '-', employee.name);
  }

  // Create new user with pending role request
  const newUserPassword = await bcryptjs.hash('NewUser@123', 10);
  const newUser = await prisma.user.create({
    data: {
      email: 'newuser@example.com',
      name: 'Alex Martinez',
      password: newUserPassword,
      globalRole: 'MEMBER',
      isVerified: true,
    },
  });

  await prisma.roleRequest.create({
    data: {
      userId: newUser.id,
      requestedRole: 'MANAGER',
      status: 'PENDING',
      reason: 'I have 3 years of experience as a project coordinator and want to grow into a management role. I am passionate about leading teams and delivering projects on time.',
      position: 'Senior Project Coordinator',
    },
  });
  console.log('✅ New user created:', newUser.email, '-', newUser.name);
  console.log('   ⏳ Pending role request for MANAGER role\n');

  // ============================================
  // PROJECT 1: FRONTEND TEAM (LOW RISK)
  // ============================================
  const project1 = await prisma.project.create({
    data: {
      name: 'Frontend: Website Redesign 2026',
      description: 'Complete redesign of the main company website with modern UI/UX',
      createdBy: admin.id,
      riskLevel: 'LOW',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: managers[0].id, role: 'MANAGER' },
          { userId: employees[0].id, role: 'MEMBER' },
          { userId: employees[1].id, role: 'MEMBER' },
          { userId: employees[2].id, role: 'MEMBER' },
        ],
      },
    },
  });
  console.log('✅ Project 1 created:', project1.name, '(LOW RISK)');

  // ============================================
  // PROJECT 2: MOBILE TEAM (MEDIUM RISK)
  // ============================================
  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile: Cross-Platform App',
      description: 'Develop iOS and Android versions of mobile application',
      createdBy: admin.id,
      riskLevel: 'MEDIUM',
      members: {
        create: [
          { userId: managers[1].id, role: 'MANAGER' },
          { userId: managers[0].id, role: 'MANAGER' },
          { userId: employees[3].id, role: 'MEMBER' },
          { userId: employees[4].id, role: 'MEMBER' },
        ],
      },
    },
  });
  console.log('✅ Project 2 created:', project2.name, '(MEDIUM RISK)');

  // ============================================
  // PROJECT 3: BACKEND TEAM (HIGH RISK)
  // ============================================
  const project3 = await prisma.project.create({
    data: {
      name: 'Backend: API Infrastructure',
      description: 'Build scalable API infrastructure and microservices architecture',
      createdBy: admin.id,
      riskLevel: 'HIGH',
      members: {
        create: [
          { userId: managers[2].id, role: 'MANAGER' },
          { userId: managers[1].id, role: 'MANAGER' },
          { userId: employees[5].id, role: 'MEMBER' },
          { userId: employees[6].id, role: 'MEMBER' },
        ],
      },
    },
  });
  console.log('✅ Project 3 created:', project3.name, '(HIGH RISK)\n');

  // ============================================
  // PROJECT 1 TASKS (Website Redesign - LOW RISK)
  // ============================================
  const p1_tasks = [
    {
      title: 'Design Homepage Mockup',
      description: 'Create high-fidelity mockup for new homepage design with latest UI patterns',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      type: 'FEATURE',
      creatorId: managers[0].id,
      assigneeId: employees[0].id,
      projectId: project1.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Setup Development Environment',
      description: 'Set up all necessary tools, Node.js, React, and build system',
      status: 'DONE',
      priority: 'HIGH',
      type: 'FEATURE',
      creatorId: managers[0].id,
      assigneeId: employees[1].id,
      projectId: project1.id,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Responsive Design Implementation',
      description: 'Implement responsive CSS for mobile, tablet, and desktop views',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      type: 'FEATURE',
      creatorId: managers[0].id,
      assigneeId: employees[2].id,
      projectId: project1.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const taskData of p1_tasks) {
    await prisma.task.create({ data: taskData });
  }
  console.log('✅ Tasks created for Project 1 (Website Redesign)');

  // ============================================
  // PROJECT 2 TASKS (Mobile - MEDIUM RISK with CRITICAL ISSUES)
  // ============================================
  const p2_tasks = [
    {
      title: '🔴 CRITICAL: iOS Authentication Module - OVERDUE',
      description: 'CRITICAL BUG: OAuth2 integration not working on iOS. Users cannot login. Blocking all testing. Assigned 5 days ago.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      type: 'BUG',
      creatorId: managers[1].id,
      assigneeId: employees[3].id,
      projectId: project2.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // OVERDUE by 2 days
    },
    {
      title: '🔴 High: Database Connection Timeout - OVERDUE',
      description: 'HIGH PRIORITY: Database queries timeout after 30 seconds on slow networks. Affects 60% of users. Needs optimization.',
      status: 'TODO',
      priority: 'HIGH',
      type: 'BUG',
      creatorId: managers[0].id,
      assigneeId: null,
      projectId: project2.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // OVERDUE by 1 day
    },
    {
      title: 'Android App Development',
      description: 'Develop Android version of mobile app with feature parity to iOS',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      type: 'FEATURE',
      creatorId: managers[1].id,
      assigneeId: employees[4].id,
      projectId: project2.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const taskData of p2_tasks) {
    await prisma.task.create({ data: taskData });
  }
  console.log('✅ Tasks created for Project 2 (Mobile App) - 🚨 With CRITICAL overdue issues!');

  // ============================================
  // PROJECT 3 TASKS (Backend - HIGH RISK with CRITICAL ISSUES)
  // ============================================
  const p3_tasks = [
    {
      title: '🚨 CRITICAL: Database Migration Failure - OVERDUE',
      description: 'CRITICAL ISSUE: Production database migration failed 3 days ago. Rollback incomplete. System experienced 2-hour downtime. Root cause analysis still pending. NEEDS IMMEDIATE ATTENTION.',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      type: 'BUG',
      creatorId: managers[2].id,
      assigneeId: employees[5].id,
      projectId: project3.id,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // OVERDUE by 3 days
    },
    {
      title: '🔴 High: API Rate Limiting Not Working - OVERDUE',
      description: 'HIGH PRIORITY: Rate limiter is not enforcing limits. System vulnerable to DDoS attacks. Security risk identified yesterday.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      type: 'BUG',
      creatorId: managers[2].id,
      assigneeId: employees[6].id,
      projectId: project3.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // OVERDUE by 1 day
    },
    {
      title: '🔴 High: Security Vulnerability in JWT',
      description: 'HIGH PRIORITY: JWT secret is hardcoded in source code. Needs environment variable implementation immediately. Compliance risk.',
      status: 'TODO',
      priority: 'HIGH',
      type: 'BUG',
      creatorId: managers[1].id,
      assigneeId: null,
      projectId: project3.id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Load Balancer Configuration',
      description: 'Configure load balancer for horizontal scaling across 5 nodes',
      status: 'IN_REVIEW',
      priority: 'HIGH',
      type: 'FEATURE',
      creatorId: managers[2].id,
      assigneeId: employees[5].id,
      projectId: project3.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'API Documentation',
      description: 'Write comprehensive API documentation with OpenAPI 3.0 specs',
      status: 'DONE',
      priority: 'MEDIUM',
      type: 'IMPROVEMENT',
      creatorId: managers[2].id,
      assigneeId: employees[6].id,
      projectId: project3.id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const taskData of p3_tasks) {
    await prisma.task.create({ data: taskData });
  }
  console.log('✅ Tasks created for Project 3 (Backend API) - 🚨 With CRITICAL issues!\n');

  // Print comprehensive seeding summary
  console.log('\n' + '━'.repeat(70));
  console.log('📊 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('━'.repeat(70));

  console.log('\n🔐 LOGIN CREDENTIALS:\n');
  console.log('👤 ADMIN:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: Admin@123`);
  console.log(`   Name: ${admin.name}`);

  console.log('\n👥 MANAGERS (3):');
  managers.forEach((manager) => {
    console.log(`   Email: ${manager.email}`);
    console.log(`   Password: Manager@123`);
    console.log(`   Name: ${manager.name}`);
  });

  console.log('\n👨‍💼 EMPLOYEES (7):');
  employees.forEach((employee) => {
    console.log(`   Email: ${employee.email}`);
    console.log(`   Password: Employee@123`);
    console.log(`   Name: ${employee.name}`);
  });

  console.log('\n🆕 NEW USER WITH PENDING ROLE REQUEST:');
  console.log(`   Email: ${newUser.email}`);
  console.log(`   Password: NewUser@123`);
  console.log(`   Name: ${newUser.name}`);
  console.log(`   Requested Role: MANAGER (Status: PENDING)`);

  console.log('\n' + '━'.repeat(70));
  console.log('📋 PROJECTS OVERVIEW:\n');

  console.log('✅ Project 1: Frontend: Website Redesign 2026');
  console.log('   Risk Level: LOW');
  console.log('   Team Lead: Alex Johnson (Frontend Lead)');
  console.log('   Team Members: James Wilson, Emma Brown, Michael Davis');
  console.log('   Tasks: 3 (1 Done, 2 In Progress)');
  console.log('   Status: ON TRACK\n');

  console.log('⚠️  Project 2: Mobile: Cross-Platform App');
  console.log('   Risk Level: MEDIUM');
  console.log('   Team Lead: Maria Garcia (Backend Lead)');
  console.log('   Team Members: Sophie Martin, Oliver Taylor');
  console.log('   Tasks: 3');
  console.log('   🔴 CRITICAL ISSUES: iOS Auth Bug (OVERDUE 2 DAYS), DB Timeout (OVERDUE 1 DAY)');
  console.log('   Status: AT RISK - IMMEDIATE ATTENTION NEEDED\n');

  console.log('🚨 Project 3: Backend: API Infrastructure');
  console.log('   Risk Level: HIGH');
  console.log('   Team Lead: David Chen (DevOps Lead)');
  console.log('   Team Members: Olivia Rodriguez, Lucas Thompson');
  console.log('   Tasks: 5 (1 Done, 4 Active)');
  console.log('   🚨 CRITICAL ISSUES:');
  console.log('      - Database Migration Failure (OVERDUE 3 DAYS)');
  console.log('      - Rate Limiter Not Working (OVERDUE 1 DAY)');
  console.log('      - JWT Security Vulnerability (Due TOMORROW)');
  console.log('   Status: CRITICAL - URGENT ACTION REQUIRED\n');

  console.log('━'.repeat(70));
  console.log('🎯 TESTING SCENARIOS:\n');
  console.log('1. Login as admin@taskflow.com → View all projects and approve role requests');
  console.log('2. Login as manager1@taskflow.com → See Frontend team dashboard (LOW risk)');
  console.log('3. Login as manager2@taskflow.com → See Mobile team with CRITICAL bugs');
  console.log('4. Login as manager3@taskflow.com → See Backend team with HIGH risk');
  console.log('5. Check dashboard risk indicators and overdue task alerts');
  console.log('6. Submit role request as newuser@example.com');
  console.log('7. View impact of critical issues on overall risk metrics\n');
  console.log('━'.repeat(70));
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
