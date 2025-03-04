// routes/musicRouter.js

const express = require("express");
const router = express.Router();
const musicController = require("../Controllers/musicController");

// Define the POST route for music suggestion
router.post("/suggest-music", musicController.suggestMusic);

module.exports = router;
