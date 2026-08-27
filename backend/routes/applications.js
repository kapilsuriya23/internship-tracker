const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const VALID_STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected', 'Mailed'];

// GET all applications
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = { userId: req.user._id };

    if (status && VALID_STATUSES.includes(status)) filter.status = status;
    if (search && search.trim().length > 0) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { company:  { $regex: escaped, $options: 'i' } },
        { role:     { $regex: escaped, $options: 'i' } },
        { location: { $regex: escaped, $options: 'i' } },
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

    const result = {
      total: 0, Applied: 0, Assessment: 0, Interview: 0,
      Offer: 0, Rejected: 0, Selected: 0, Mailed: 0
    };
    stats.forEach(s => { result[s._id] = s.count; result.total += s.count; });
    res.json({ stats: result });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET analytics
router.get('/analytics', async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id })
      .select('status appliedDate updatedAt company location')
      .lean();

    // Weekly timeline
    const weekMap = {};
    apps.forEach(a => {
      if (!a.appliedDate) return;
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

    // Status distribution
    const distribution = {};
    apps.forEach(a => { distribution[a.status] = (distribution[a.status] || 0) + 1; });

    // Pipeline funnel
    const PIPELINE = ['Applied', 'Assessment', 'Interview', 'Offer', 'Selected'];
    const rank = s => PIPELINE.indexOf(s);
    const funnel = PIPELINE.map(stage => ({
      stage,
      count: apps.filter(a => rank(a.status) >= 0 && rank(a.status) >= rank(stage)).length
    }));

    // Avg response time
    const responded = apps.filter(a => a.status !== 'Applied' && a.appliedDate);
    const avgResponseDays = responded.length
      ? Math.round(
          responded.reduce((sum, a) => sum + (new Date(a.updatedAt) - new Date(a.appliedDate)), 0)
          / responded.length / (1000 * 60 * 60 * 24)
        )
      : 0;

    // Top companies by application count
    const companyMap = {};
    apps.forEach(a => { companyMap[a.company] = (companyMap[a.company] || 0) + 1; });
    const topCompanies = Object.entries(companyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    // Top locations
    const locationMap = {};
    apps.forEach(a => {
      if (a.location) locationMap[a.location] = (locationMap[a.location] || 0) + 1;
    });
    const topLocations = Object.entries(locationMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    const total = apps.length;
    const selected = apps.filter(a => a.status === 'Selected').length;
    const successRate = total ? Math.round((selected / total) * 100) : 0;

    res.json({ timeline, distribution, funnel, avgResponseDays, topCompanies, topLocations, successRate, total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST test reminder
router.post('/test-reminder', async (req, res) => {
  try {
    const { sendDeadlineReminder, sendTestEmail } = require('../utils/emailService');
    console.log('📧 Test reminder requested by:', req.user.email);

    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const upcomingApps = await Application.find({
      userId: req.user._id,
      appliedDate: { $gte: now, $lte: in48h },
      status: { $in: ['Applied', 'Assessment', 'Interview', 'Offer'] },
    });

    if (upcomingApps.length > 0) {
      await sendDeadlineReminder(req.user.email, req.user.name, upcomingApps);
      return res.json({
        message: `Reminder sent to ${req.user.email} for ${upcomingApps.length} application(s).`,
        sent: true
      });
    }

    await sendTestEmail(req.user.email, req.user.name);
    return res.json({
      message: `Test email sent to ${req.user.email}.`,
      sent: true
    });
  } catch (err) {
    console.error('❌ Test reminder error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to send email.' });
  }
});

// POST create application
router.post('/', [
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('status').optional().isIn(VALID_STATUSES),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { company, role, location, jobLink, appliedDate, status, recruiterEmail, tracking } = req.body;
    const application = await Application.create({
      userId: req.user._id,
      company, role, location, jobLink,
      appliedDate: appliedDate || null,
      status: status || 'Applied',
      recruiterEmail, tracking
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
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

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
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { company, role, location, jobLink, appliedDate, status, recruiterEmail, tracking } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { company, role, location, jobLink, appliedDate: appliedDate || null,
        status, recruiterEmail, tracking, reminderSent: false },
      { new: true, runValidators: true }
    );
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE application
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id, userId: req.user._id
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;