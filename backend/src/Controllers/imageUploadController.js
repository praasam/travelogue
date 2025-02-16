const multer = require("multer");
const path = require("path");
const Image = require("../Models/imageModel"); // Import Image Model

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with extension
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Upload Images and Save to DB
const uploadImages = async (req, res) => {
  try {
    const { userId } = req.body; // Get userId from request body
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Prepare the image data to be saved
    const uploadedFiles = req.files.map((file) => ({
      images: `/uploads/${file.filename}`, // Path to the uploaded file
      user: userId, // Link the image to the user
    }));

    // Save images in the database
    const savedImages = await Image.insertMany(uploadedFiles);

    // Respond with the URLs of the uploaded images
    res.status(201).json({
      message: "Images uploaded and saved successfully",
      images: savedImages,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
};

module.exports = { upload, uploadImages };
