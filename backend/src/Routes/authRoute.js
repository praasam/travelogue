// src/Routes/authRoute.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, changePassword } = require('../Controllers/authController');
const authMiddleware = require('../Middleware/authMiddleware');

// Register and login routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Now this line should work because changePassword is properly imported
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;