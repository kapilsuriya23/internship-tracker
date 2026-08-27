const mongoose = require('mongoose');

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected', 'Mailed'];

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name too long']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [100, 'Role name too long']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location too long']
  },
  jobLink: {
    type: String,
    trim: true,
  },
  appliedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'Applied'
  },
  recruiterEmail: {
    type: String,
    trim: true,
  },
  tracking: {
    type: String,
    trim: true,
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);