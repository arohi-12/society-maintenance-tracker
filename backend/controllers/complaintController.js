const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const User = require('../models/User');
const { sendComplaintStatusEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');

// Helper to run overdue check and update the database
const runOverdueCheck = async () => {
  try {
    const thresholdDays = parseInt(process.env.OVERDUE_THRESHOLD_DAYS, 10) || 3;
    const cutoffDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

    // 1. Mark open complaints older than threshold as overdue
    await Complaint.updateMany(
      {
        currentStatus: { $ne: 'Resolved' },
        createdAt: { $lt: cutoffDate },
        isOverdue: false
      },
      { isOverdue: true }
    );

    // 2. Ensure resolved complaints are not marked overdue
    await Complaint.updateMany(
      {
        currentStatus: 'Resolved',
        isOverdue: true
      },
      { isOverdue: false }
    );
  } catch (error) {
    console.error('Error running overdue check:', error.message);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Resident)
const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;

    if (!category || !description) {
      // If photo was uploaded, clean it up on failure
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }

    let photoUrl = '';
    if (req.file) {
      // Store relative path that can be served statically
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Create the complaint
    const complaint = await Complaint.create({
      residentId: req.user.id,
      category,
      description,
      photoUrl
    });

    // Create the initial history log
    await ComplaintHistory.create({
      complaintId: complaint._id,
      status: 'Open',
      actorId: req.user.id,
      note: 'Complaint registered by resident'
    });

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Resident/Admin)
const getComplaints = async (req, res) => {
  try {
    // Run the overdue check to keep database flags accurate before fetching
    await runOverdueCheck();

    let query = {};

    // Residents only see their own complaints
    if (req.user.role === 'Resident') {
      query.residentId = req.user.id;
    } else {
      // Admins see all, but can apply filters
      const { category, status, date } = req.query;

      if (category) {
        query.category = category;
      }
      if (status) {
        query.currentStatus = status;
      }
      if (date) {
        // Filter by specific day (match year-month-day)
        const searchDate = new Date(date);
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    // Sorting: Overdue complaints appear at the top, then newest complaints first
    const complaints = await Complaint.find(query)
      .populate('residentId', 'name email')
      .sort({ isOverdue: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint details with status history
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('residentId', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Role check: Residents can only view their own complaints
    if (req.user.role === 'Resident' && complaint.residentId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    // Fetch the history logs
    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .populate('actorId', 'name role')
      .sort({ timestamp: 1 }); // oldest (Open) to newest status

    res.status(200).json({
      success: true,
      data: {
        complaint,
        history
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint priority
// @route   PATCH /api/complaints/:id/priority
// @access  Private (Admin only)
const updateComplaintPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid priority (Low, Medium, High)' });
    }

    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.priority = priority;
    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status (and append to history)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin only)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status (Open, In Progress, Resolved)' });
    }

    let complaint = await Complaint.findById(req.params.id).populate('residentId', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Save previous status
    const previousStatus = complaint.currentStatus;

    complaint.currentStatus = status;

    if (status === 'Resolved') {
      complaint.resolvedAt = Date.now();
      complaint.isOverdue = false;
    } else {
      complaint.resolvedAt = undefined;
    }

    await complaint.save();

    // Create a status history record
    await ComplaintHistory.create({
      complaintId: complaint._id,
      status,
      actorId: req.user.id,
      note: note || `Status updated from ${previousStatus} to ${status}`
    });

    // Send email notification to resident on status change
    if (complaint.residentId && complaint.residentId.email) {
      await sendComplaintStatusEmail(
        complaint.residentId.email,
        complaint.residentId.name,
        complaint._id,
        complaint.category,
        status,
        note
      );
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintPriority,
  updateComplaintStatus
};
