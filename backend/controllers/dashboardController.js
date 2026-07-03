const Complaint = require('../models/Complaint');

// @desc    Get dashboard metrics and counts
// @route   GET /api/dashboard/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const thresholdDays = parseInt(process.env.OVERDUE_THRESHOLD_DAYS, 10) || 3;
    const cutoffDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

    // Sync overdue flags in DB before aggregating
    await Complaint.updateMany(
      {
        currentStatus: { $ne: 'Resolved' },
        createdAt: { $lt: cutoffDate },
        isOverdue: false
      },
      { isOverdue: true }
    );
    await Complaint.updateMany(
      {
        currentStatus: 'Resolved',
        isOverdue: true
      },
      { isOverdue: false }
    );

    const totalComplaints = await Complaint.countDocuments();
    const totalOverdue = await Complaint.countDocuments({ isOverdue: true });

    // Count complaints grouped by currentStatus
    const statusCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count complaints grouped by category
    const categoryCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format results to friendly structures
    const byStatus = {
      Open: 0,
      'In Progress': 0,
      Resolved: 0
    };
    statusCounts.forEach((item) => {
      if (item._id in byStatus) {
        byStatus[item._id] = item.count;
      }
    });

    const byCategory = {};
    categoryCounts.forEach((item) => {
      byCategory[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalComplaints,
        byStatus,
        byCategory,
        totalOverdue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
