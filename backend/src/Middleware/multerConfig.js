const multer = require("multer");
const path = require("path");

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Upload folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Set up multer to handle file uploads
const upload = multer({ storage });

const uploadImages = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      user: userId,
    }));

    const savedImages = await Image.insertMany(uploadedFiles);

    // Send back the URLs of the uploaded images
    const imageUrls = savedImages.map(image => image.url);

    res.status(201).json({
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
};

// Ensure multer and route are used correctly
router.post("/upload", upload.array("photos"), uploadImages);
