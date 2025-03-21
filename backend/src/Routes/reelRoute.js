const express = require("express");
const { createReel, getUserReels, deleteReel } = require("../Controllers/reelController");

const router = express.Router();

// Route for creating a reel
router.post("/create", createReel);

// GET route to fetch reels for a specific user
router.get("/:userId", getUserReels);

router.delete("/delete", deleteReel);

module.exports = router;