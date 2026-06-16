require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n📧 Testing email config...');
console.log('HOST:', process.env.EMAIL_HOST);
console.log('PORT:', process.env.EMAIL_PORT);
console.log('USER:', process.env.EMAIL_USER);
console.log('PASS:', process.env.EMAIL_PASS ? `✅ set (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET');
console.log('FROM:', process.env.EMAIL_FROM);
console.log('');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"InternTrack Test" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ InternTrack Email Test',
      html: '<h2 style="color:#4b7cf3;">It works!</h2><p>Your InternTrack email setup is configured correctly.</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Check inbox at:', process.env.EMAIL_USER);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    if (err.message.includes('Invalid login') || err.message.includes('535')) {
      console.error('\n💡 Fix: Wrong credentials. Double-check EMAIL_USER and EMAIL_PASS in .env');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      console.error('\n💡 Fix: Cannot reach SMTP server. Check EMAIL_HOST and EMAIL_PORT');
    } else if (err.message.includes('not set')) {
      console.error('\n💡 Fix: Add EMAIL_USER and EMAIL_PASS to your .env file');
    }
  }
}

test();