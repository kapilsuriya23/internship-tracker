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
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
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
      { company, role, applicationLink, appliedDate, deadline, status },
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