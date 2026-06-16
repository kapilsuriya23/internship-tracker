const cron = require('node-cron');
const Application = require('../models/Application');
const { sendDeadlineReminder } = require('../utils/emailService');

const ACTIVE_STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer'];

const checkAndSendReminders = async () => {
  console.log('🔔 Running deadline reminder check...');
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  try {
    const apps = await Application.find({
      deadline: { $gte: now, $lte: in48h },
      status: { $in: ACTIVE_STATUSES },
      reminderSent: false,
    }).populate('userId', 'name email emailRemindersEnabled');

    // Group applications by user
    const byUser = {};
    apps.forEach(app => {
      if (!app.userId || !app.userId.emailRemindersEnabled) return;
      const uid = app.userId._id.toString();
      if (!byUser[uid]) byUser[uid] = { user: app.userId, apps: [] };
      byUser[uid].apps.push(app);
    });

    let sentCount = 0;
    for (const uid in byUser) {
      const { user, apps: userApps } = byUser[uid];
      await sendDeadlineReminder(user.email, user.name, userApps);
      await Application.updateMany(
        { _id: { $in: userApps.map(a => a._id) } },
        { reminderSent: true }
      );
      sentCount++;
      console.log(`✅ Reminder sent to ${user.email} (${userApps.length} application(s))`);
    }

    console.log(sentCount === 0 ? '✓ No reminders due.' : `✓ Sent ${sentCount} reminder email(s).`);
  } catch (err) {
    console.error('❌ Reminder job error:', err.message);
  }
};

const startReminderJob = () => {
  // Runs every day at 8:00 AM server time
  cron.schedule('0 8 * * *', checkAndSendReminders);
  console.log('⏰ Deadline reminder job scheduled (daily at 08:00)');
};

module.exports = { startReminderJob, checkAndSendReminders };