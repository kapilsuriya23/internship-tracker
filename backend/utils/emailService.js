const nodemailer = require('nodemailer');

console.log('📧 Email config:', {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  user: process.env.EMAIL_USER || 'NOT SET',
  pass: process.env.EMAIL_PASS ? `✅ set (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET',
});

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS not set in .env');
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }
  });
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

const daysUntil = (deadline) => {
  const diff = new Date(deadline).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const STATUS_COLORS = {
  Applied:    { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
  Assessment: { bg: '#fefce8', text: '#ca8a04', border: '#fde68a' },
  Interview:  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  Offer:      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Rejected:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  Selected:   { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
};

const buildApplicationCard = (app) => {
  const days = daysUntil(app.deadline);
  const isToday = days === 0;
  const isTomorrow = days === 1;
  const isOverdue = days < 0;

  const urgencyBg    = isOverdue ? '#fef2f2' : isToday ? '#fff7ed' : isTomorrow ? '#fffbeb' : '#f0f9ff';
  const urgencyBorder= isOverdue ? '#fecaca' : isToday ? '#fed7aa' : isTomorrow ? '#fde68a' : '#bae6fd';
  const urgencyColor = isOverdue ? '#dc2626' : isToday ? '#ea580c' : isTomorrow ? '#d97706' : '#0284c7';
  const urgencyIcon  = isOverdue ? '🚨' : isToday ? '⚠️' : isTomorrow ? '⏰' : '📅';
  const urgencyText  = isOverdue
    ? `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}!`
    : isToday ? 'Due TODAY — submit immediately!'
    : isTomorrow ? 'Due TOMORROW'
    : `${days} days remaining`;

  const status = app.status || 'Applied';
  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.Applied;

  return `
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:16px;overflow:hidden;">
      <!-- Card Header -->
      <div style="padding:18px 20px;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:12px;">
            <!-- Company initial avatar -->
            <div style="width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#4b7cf3,#3a6be0);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="color:#fff;font-size:20px;font-weight:800;line-height:1;">${app.company[0].toUpperCase()}</span>
            </div>
            <div>
              <h3 style="margin:0 0 3px;font-size:17px;font-weight:800;color:#111827;">${app.company}</h3>
              <p style="margin:0;font-size:13px;color:#6b7280;font-weight:500;">${app.role}</p>
            </div>
          </div>
          <!-- Status badge -->
          <span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:${statusStyle.bg};color:${statusStyle.text};border:1px solid ${statusStyle.border};">
            ${status}
          </span>
        </div>
      </div>

      <!-- Card Details -->
      <div style="padding:16px 20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;width:50%;vertical-align:top;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;">Applied On</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#374151;">
                📆 ${fmtDate(app.appliedDate)}
              </p>
            </td>
            <td style="padding:6px 0;width:50%;vertical-align:top;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;">Deadline</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#374151;">
                🗓️ ${fmtDate(app.deadline)}
              </p>
            </td>
          </tr>
          ${app.applicationLink ? `
          <tr>
            <td colspan="2" style="padding:10px 0 0;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;">Application Link</p>
              <a href="${app.applicationLink}" style="display:inline-block;margin-top:4px;font-size:13px;color:#4b7cf3;font-weight:600;text-decoration:none;">
                🔗 Open Job Posting →
              </a>
            </td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Urgency Banner -->
      <div style="margin:0 16px 16px;padding:10px 14px;border-radius:8px;background:${urgencyBg};border:1px solid ${urgencyBorder};">
        <p style="margin:0;font-size:13px;font-weight:700;color:${urgencyColor};">
          ${urgencyIcon} ${urgencyText}
        </p>
      </div>
    </div>`;
};

const buildReminderHtml = (userName, applications) => {
  const cards = applications.map(buildApplicationCard).join('');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a2236,#0d1117);border-radius:16px 16px 0 0;padding:32px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:36px;height:36px;border-radius:8px;background:#4b7cf3;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:18px;">⚡</span>
          </div>
          <span style="color:#a3b0cc;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">InternTrack</span>
        </div>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:800;line-height:1.2;">
          ⏰ Deadline Reminder
        </h1>
        <p style="margin:0;color:#6b7a99;font-size:14px;">${today}</p>
      </div>

      <!-- Intro Banner -->
      <div style="background:#4b7cf3;padding:16px 24px;">
        <p style="margin:0;color:#ffffff;font-size:14px;font-weight:600;">
          Hi ${userName} 👋 — You have <strong>${applications.length} application${applications.length > 1 ? 's' : ''}</strong> with deadlines in the next 48 hours. Don't miss out!
        </p>
      </div>

      <!-- Application Cards -->
      <div style="background:#f9fafb;padding:20px;">
        ${cards}
      </div>

      <!-- CTA -->
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px;text-align:center;">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;font-weight:600;">
          Ready to take action?
        </p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
          style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4b7cf3,#3a6be0);color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.02em;">
          Open InternTrack Dashboard →
        </a>
      </div>

      <!-- Tips -->
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#374151;">💡 Quick Tips</p>
        <ul style="margin:0;padding-left:18px;">
          <li style="font-size:13px;color:#6b7280;padding:4px 0;">Submit early — last-minute applications often get missed</li>
          <li style="font-size:13px;color:#6b7280;padding:4px 0;">Update your status in InternTrack after submitting</li>
          <li style="font-size:13px;color:#6b7280;padding:4px 0;">Follow up 1 week after submission if no response</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="text-align:center;padding:16px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
          You're receiving this because email reminders are enabled in InternTrack.
        </p>
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          To disable, click the bell icon in your dashboard settings.
        </p>
      </div>

    </div>
  </body>
  </html>`;
};

const buildTestHtml = (userName) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
      <div style="background:linear-gradient(135deg,#1a2236,#0d1117);border-radius:16px 16px 0 0;padding:32px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <div style="width:36px;height:36px;border-radius:8px;background:#4b7cf3;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:18px;">⚡</span>
          </div>
          <span style="color:#a3b0cc;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">InternTrack</span>
        </div>
        <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:800;">✅ Test Successful!</h1>
        <p style="margin:0;color:#6b7a99;font-size:14px;">Your email reminders are configured correctly.</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
          Hi <strong>${userName}</strong>, your InternTrack email reminder system is working perfectly!
        </p>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;margin-bottom:20px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:#0284c7;">📋 How it works</p>
          <ul style="margin:8px 0 0;padding-left:18px;">
            <li style="font-size:13px;color:#0369a1;padding:3px 0;">Checks your applications every day at <strong>8:00 AM</strong></li>
            <li style="font-size:13px;color:#0369a1;padding:3px 0;">Sends reminders for deadlines within <strong>48 hours</strong></li>
            <li style="font-size:13px;color:#0369a1;padding:3px 0;">Includes company name, role, status, and application link</li>
            <li style="font-size:13px;color:#0369a1;padding:3px 0;">Each application is reminded only <strong>once</strong></li>
          </ul>
        </div>
        <p style="margin:0;font-size:13px;color:#9ca3af;">
          To disable reminders, click the bell icon in your InternTrack dashboard.
        </p>
      </div>
    </div>
  </body>
  </html>`;

// ── Public functions ──────────────────────────────────────────

const sendDeadlineReminder = async (toEmail, userName, applications) => {
  const transporter = createTransporter();
  console.log(`📤 Sending reminder to ${toEmail} for ${applications.length} app(s)...`);
  await transporter.verify();

  const info = await transporter.sendMail({
    from: `"InternTrack" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `⏰ ${applications.length} deadline${applications.length > 1 ? 's' : ''} coming up — InternTrack`,
    html: buildReminderHtml(userName, applications),
  });

  console.log('✅ Reminder sent | ID:', info.messageId);
  return info;
};

const sendTestEmail = async (toEmail, userName) => {
  const transporter = createTransporter();
  console.log(`📤 Sending test email to ${toEmail}...`);
  await transporter.verify();

  const info = await transporter.sendMail({
    from: `"InternTrack" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '✅ InternTrack — Email Reminders Are Working!',
    html: buildTestHtml(userName),
  });

  console.log('✅ Test email sent | ID:', info.messageId);
  return info;
};

module.exports = { sendDeadlineReminder, sendTestEmail };