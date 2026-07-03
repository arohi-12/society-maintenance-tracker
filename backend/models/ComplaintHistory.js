const mongoose = require('mongoose');

const ComplaintHistorySchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: [true, 'Complaint ID is required']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Open', 'In Progress', 'Resolved']
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor ID is required']
  },
  note: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ComplaintHistory', ComplaintHistorySchema);
