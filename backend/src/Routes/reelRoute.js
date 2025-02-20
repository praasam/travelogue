const express = require("express");
const { createReel } = require("../Controllers/reelController");

const router = express.Router();

// Route for creating a reel (no file upload needed here)
router.post("/create", createReel);  // Call createReel controller to generate the video

module.exports = router;
