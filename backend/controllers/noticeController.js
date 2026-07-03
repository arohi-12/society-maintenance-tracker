const Notice = require('../models/Notice');
const User = require('../models/User');
const { sendImportantNoticeEmail } = require('../services/emailService');

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin only)
const createNotice = async (req, res) => {
  try {
    const { title, description, isImportant } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const notice = await Notice.create({
      title,
      description,
      isImportant: !!isImportant
    });

    // If notice is important, send email notification to all residents
    if (notice.isImportant) {
      try {
        const residents = await User.find({ role: 'Resident' }).select('email');
        const residentEmails = residents.map((u) => u.email).filter(Boolean);

        if (residentEmails.length > 0) {
          // Fire email dispatch asynchronously so notice creation returns immediately
          sendImportantNoticeEmail(residentEmails, title, description);
        }
      } catch (err) {
        console.error('Failed to dispatch notice emails:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private (Resident/Admin)
const getNotices = async (req, res) => {
  try {
    // Sort: Important/pinned notices first (isImportant: -1), then newest first (createdAt: -1)
    const notices = await Notice.find({}).sort({ isImportant: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notice (Admin optional helper for notice management)
// @route   DELETE /api/notices/:id
// @access  Private (Admin only)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notice removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createNotice,
  getNotices,
  deleteNotice
};
