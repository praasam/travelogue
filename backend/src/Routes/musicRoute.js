// routes/musicRouter.js

const express = require("express");
const router = express.Router();
const { suggestMusic } = require("../Controllers/musicController");

// Define the POST route for music suggestion
router.post("/suggest-music", suggestMusic);

module.exports = router;
