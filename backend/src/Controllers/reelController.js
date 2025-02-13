const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.post("/create-reel", (req, res) => {
    const { images, audio } = req.body;

    if (!images || !audio) {
        return res.status(400).json({ error: "Images and audio are required!" });
    }

    // Convert images array to a string for Python
    const imagesList = images.join(" ");
    const pythonScript = path.join(__dirname, "../../model/reel_creator.py");

    // Run the Python script
    exec(`python ${pythonScript} ${imagesList} ${audio}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "Failed to create reel!" });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: "Error in script execution!" });
        }

        res.json({ message: "Reel created successfully!", output: stdout.trim() });
    });
});

module.exports = router;
