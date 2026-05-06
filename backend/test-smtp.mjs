// Quick SMTP test — run with: node test-smtp.mjs
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config(); // loads .env

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

console.log('\n🔍 SMTP Config loaded:');
console.log(`   Host: ${host}`);
console.log(`   Port: ${port}`);
console.log(`   User: ${user}`);
console.log(`   Pass: ${pass ? `${'*'.repeat(pass.length - 4)}${pass.slice(-4)}` : '❌ NOT SET'}`);
console.log(`   Pass length: ${pass?.length ?? 0} chars (should be 16 for Gmail App Password)\n`);

if (!host || !user || !pass) {
  console.error('❌ Missing SMTP credentials in .env. Exiting.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

console.log('⏳ Verifying SMTP connection...');

try {
  await transporter.verify();
  console.log('✅ SMTP connection verified — credentials are correct!\n');

  console.log(`⏳ Sending test email to ${user}...`);
  const info = await transporter.sendMail({
    from: `TaskFlow Test <${user}>`,
    to: user, // sends to yourself
    subject: '✅ TaskFlow SMTP Test',
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#0f172a;color:#f1f5f9;border-radius:8px">
        <h2 style="color:#6366f1">TaskFlow SMTP Test</h2>
        <p>If you're reading this, your SMTP config is working correctly! 🎉</p>
        <p style="color:#94a3b8;font-size:13px">Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
  });

  console.log('✅ Email sent successfully!');
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   Check your inbox at: ${user}\n`);
} catch (err) {
  console.error('❌ SMTP Error:', err.message);
  
  if (err.message.includes('Invalid login') || err.message.includes('BadCredentials')) {
    console.error('\n💡 Fix: Your SMTP_PASS is wrong. For Gmail you need an App Password.');
    console.error('   → Go to: https://myaccount.google.com/apppasswords');
    console.error('   → Create a new one, paste it WITHOUT spaces into SMTP_PASS in .env');
  } else if (err.message.includes('ECONNREFUSED')) {
    console.error('\n💡 Fix: Cannot connect to SMTP host. Check SMTP_HOST and SMTP_PORT.');
  } else if (err.message.includes('self signed') || err.message.includes('certificate')) {
    console.error('\n💡 Fix: TLS certificate issue. Try setting SMTP_PORT=465 in .env');
  }
  process.exit(1);
}
