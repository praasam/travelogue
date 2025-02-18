const multer = require("multer");
const path = require("path");
const Image = require("../Models/imageModel"); // Import Image Model
const fs = require("fs");

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
      images: `/uploads/${file.filename}`, // Prepend the '/uploads/' path
      user: userId, // Ensure userId is stored correctly
    }));

    // Save images in the database
    const savedImages = await Image.insertMany(uploadedFiles);

    // Respond with the URLs of the uploaded images
    res.status(201).json({
      message: "Images uploaded and saved successfully",
      images: savedImages.map(img => img.images), // Return only the image URLs
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
};


const getUserImages = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const images = await Image.find({ user: userId });

    if (!images.length) {
      return res.status(404).json({ message: "No images found" });
    }

    // Return full image path
    const imageUrls = images.map(img => `/uploads/${img.images}`); // Ensure '/uploads/' prefix is added

    res.status(200).json({ images: imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Error fetching images", error: error.message });
  }
};


// Delete image from database and filesystem
const deleteImage = async (userId, imageUrl) => {
  try {
    console.log("Image URL received:", imageUrl); // Log the URL being passed to delete
    
    // Extract the image filename
    const imageFileName = imageUrl.split("/uploads/")[1];
    console.log("Extracted image filename:", imageFileName);

    // Check the images stored in the database for the given userId
    const imagesInDb = await Image.find({ user: userId });
    console.log("Images stored in the database:", imagesInDb);

    // Delete the image from the database
    const deletedImage = await Image.findOneAndDelete({ user: userId, images: `/uploads/${imageFileName}` });
    console.log("Deleted image from database:", deletedImage);
    
    if (!deletedImage) {
      throw new Error("Image not found in database");
    }

    // If deletion from DB is successful, remove the file from the filesystem
    const filePath = path.join(__dirname, "..", "uploads", imageFileName);
console.log("File path for deletion:", filePath);

if (fs.existsSync(filePath)) {
  try {
    fs.unlinkSync(filePath);
    console.log("File deleted successfully.");
  } catch (error) {
    console.error("Error deleting image:", error);
  }
} else {
  console.log(`File not found at path: ${filePath}`);
}
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};





module.exports = { upload, uploadImages, getUserImages, deleteImage};


