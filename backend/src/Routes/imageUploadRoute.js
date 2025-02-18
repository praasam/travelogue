// In routes/imageUploadRoute.js
const express = require("express");
const { upload, uploadImages, deleteImage } = require("../Controllers/imageUploadController"); // Import controller
const ImageModel = require('../Models/imageModel'); // Adjust the path based on your project structure
const mongoose = require("mongoose"); // ✅ Add this line

const router = express.Router();

// POST route for uploading images (using multer to handle file uploads)
router.post("/upload", upload.array("photos"), uploadImages);

// Dummy function for image retrieval (replace with your database query logic)


// GET images by userId
router.get("/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Fetching images for user:", userId);
  
      // Find images associated with the user ID
      const userImages = await ImageModel.find({ user: new mongoose.Types.ObjectId(userId) });
  
      if (!userImages || userImages.length === 0) {
        return res.status(200).json({ images: [] });
      }
  
      // Send back image URLs
      res.json({ images: userImages.flatMap((img) => img.images) });

    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // DELETE route for deleting images
  router.delete("/delete", async (req, res) => {
    try {
      const { userId, imageUrl } = req.body;
  
      if (!userId || !imageUrl) {
        return res.status(400).json({ message: "User ID and Image URL are required" });
      }
  
      // Call deleteImage to handle actual image deletion logic
      await deleteImage(userId, imageUrl);
  
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Error deleting image" });
    }
  });
  


module.exports = router;