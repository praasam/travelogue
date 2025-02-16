// In routes/imageUploadRoute.js
const express = require("express");
const { upload, uploadImages } = require("../Controllers/imageUploadController"); // Import controller

const router = express.Router();

// POST route for uploading images (using multer to handle file uploads)
router.post("/upload", upload.array("photos"), uploadImages);

module.exports = router;