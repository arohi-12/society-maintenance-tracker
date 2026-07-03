const express = require('express');
const router = express.Router();
const { registerResident, login } = require('../controllers/authController');

router.post('/register', registerResident);
router.post('/login', login);

module.exports = router;
