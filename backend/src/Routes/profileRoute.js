const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');  // Import fs module to check and create directories
const { uploadProfileImage, getProfile, updateProfile } = require('../Controllers/profileController');
const verifyToken = require('../Middleware/authMiddleware');

// Ensure the 'uploads/profile-images' directory exists
const uploadDirectory = './uploads/profile-images';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true }); // Create the directory if it doesn't exist
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Use the uploadDirectory variable here
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});

// Define the route to get the user's profile
router.get('/profile', verifyToken, getProfile);

// Define the route for uploading the profile image
router.post('/upload-profile-image', verifyToken, upload.single('profileImage'), uploadProfileImage);

// Define the route for updating profile details
router.put('/update-profile', verifyToken, updateProfile);

module.exports = router;