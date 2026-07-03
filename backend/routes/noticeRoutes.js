const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createNotice, getNotices, deleteNotice } = require('../controllers/noticeController');

router.route('/')
  .post(protect, authorize('Admin'), createNotice)
  .get(protect, getNotices);

router.route('/:id')
  .delete(protect, authorize('Admin'), deleteNotice);

module.exports = router;
