const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

const VALID_STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

// GET all applications for user
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { userId: req.user._id };

    if (status && VALID_STATUSES.includes(status)) {
      filter.status = status;
    }
    if (search && search.trim().length > 0) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { company: { $regex: escaped, $options: 'i' } },
        { role: { $regex: escaped, $options: 'i' } }
      ];
    }

    const applications = await Application.find(filter).sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = { total: 0, Applied: 0, Assessment: 0, Interview: 0, Offer: 0, Rejected: 0, Selected: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    res.json({ stats: result });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET analytics data
router.get('/analytics', async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id })
      .select('status appliedDate updatedAt company')
      .lean();

    // 1. Applications over time — grouped by week (last 10 weeks, Monday start)
    const weekMap = {};
    apps.forEach(a => {
      const d = new Date(a.appliedDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      const key = monday.toISOString().split('T')[0];
      weekMap[key] = (weekMap[key] || 0) + 1;
    });
    const timeline = Object.entries(weekMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-10)
      .map(([date, count]) => ({ date, count }));

    // 2. Status distribution
    const distribution = {};
    apps.forEach(a => { distribution[a.status] = (distribution[a.status] || 0) + 1; });

    // 3. Pipeline funnel snapshot (excludes Rejected — shows current stage reach)
    const PIPELINE = ['Applied', 'Assessment', 'Interview', 'Offer', 'Selected'];
    const rank = s => PIPELINE.indexOf(s);
    const funnel = PIPELINE.map(stage => ({
      stage,
      count: apps.filter(a => rank(a.status) >= 0 && rank(a.status) >= rank(stage)).length
    }));

    // 4. Avg response time (days between appliedDate and updatedAt, for non-Applied apps)
    const responded = apps.filter(a => a.status !== 'Applied');
    const avgResponseDays = responded.length
      ? Math.round(
          responded.reduce((sum, a) => sum + (new Date(a.updatedAt) - new Date(a.appliedDate)), 0)
          / responded.length / (1000 * 60 * 60 * 24)
        )
      : 0;

    // 5. Top companies by application count
    const companyMap = {};
    apps.forEach(a => { companyMap[a.company] = (companyMap[a.company] || 0) + 1; });
    const topCompanies = Object.entries(companyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // 6. Success rate
    const total = apps.length;
    const selected = apps.filter(a => a.status === 'Selected').length;
    const successRate = total ? Math.round((selected / total) * 100) : 0;

    res.json({ timeline, distribution, funnel, avgResponseDays, topCompanies, successRate, total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create application
router.post('/', [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('appliedDate').notEmpty().withMessage('Applied date is required').isISO8601(),
  body('status').optional().isIn(VALID_STATUSES)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { company, role, applicationLink, appliedDate, deadline, status } = req.body;
    const application = await Application.create({
      userId: req.user._id,
      company, role, applicationLink, appliedDate, deadline,
      status: status || 'Applied'
    });
    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update status
router.patch('/:id/status', [
  body('status').isIn(VALID_STATUSES).withMessage('Invalid status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update full application
router.put('/:id', [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('appliedDate').notEmpty().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { company, role, applicationLink, appliedDate, deadline, status } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { company, role, applicationLink, appliedDate, deadline, status ,reminderSent: false},
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST test reminder — always sends regardless of deadline/reminderSent
router.post('/test-reminder', async (req, res) => {
  try {
    const { sendDeadlineReminder, sendTestEmail } = require('../utils/emailService');

    console.log('📧 Test reminder requested by:', req.user.email);

    // First try to find apps with upcoming deadlines
    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const upcomingApps = await Application.find({
      userId: req.user._id,
      deadline: { $gte: now, $lte: in48h },
      status: { $in: ['Applied', 'Assessment', 'Interview', 'Offer'] },
    });

    if (upcomingApps.length > 0) {
      // Send real reminder with actual upcoming deadlines
      await sendDeadlineReminder(req.user.email, req.user.name, upcomingApps);
      return res.json({
        message: `Reminder email sent to ${req.user.email} with ${upcomingApps.length} upcoming deadline(s).`,
        sent: true
      });
    }

    // No upcoming deadlines — send a plain test email instead
    await sendTestEmail(req.user.email, req.user.name);
    return res.json({
      message: `Test email sent to ${req.user.email}. No upcoming deadlines found — a confirmation email was sent instead.`,
      sent: true
    });

  } catch (err) {
    console.error('❌ Test reminder error:', err.message);
    return res.status(500).json({
      error: err.message || 'Failed to send email. Check EMAIL_USER and EMAIL_PASS in your .env file.'
    });
  }
});


// DELETE application
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;