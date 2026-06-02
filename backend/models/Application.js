const mongoose = require('mongoose');

const STATUSES = ['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Selected'];

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
  applicationLink: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid URL']
  },
  appliedDate: {
    type: Date,
    required: [true, 'Applied date is required']
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'Applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);