const express = require("express");
const { createReel, getUserReels } = require("../Controllers/reelController");

const router = express.Router();

// Route for creating a reel
router.post("/create", createReel);

// GET route to fetch reels for a specific user
router.get("/:userId", getUserReels);

module.exports = router;
