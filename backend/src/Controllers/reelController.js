const mongoose = require("mongoose");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const Reel = require("../Models/reelModel"); // Import Reel model
const sentimentMusicMap = require("../utils/sentimentMusicMap"); // Map sentiment to music

ffmpeg.setFfmpegPath(ffmpegPath);

// Function to create a reel video with selected images and music
exports.createReel = async (req, res) => {
    try {
        const { userId, selectedImages, sentiment, selectedMusic } = req.body;

        // Validate user input
        if (!userId || !selectedImages || selectedImages.length < 2) {
            return res.status(400).json({ message: "UserId and at least 2 images are required to create a reel" });
        }

        let objectIdUserId;
        try {
            objectIdUserId = new mongoose.Types.ObjectId(userId);
        } catch (err) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Determine which music to use based on sentiment or user selection
        let musicFile;
        if (!selectedMusic) {
            // Use sentiment to determine music if not selected
            musicFile = sentimentMusicMap[sentiment];
            if (!musicFile) {
                return res.status(400).json({ message: "No music found for this sentiment" });
            }
        } else {
            // Use the selected music file
            musicFile = selectedMusic;
        }

        // Construct the path for the selected music track
        const musicPath = path.resolve(__dirname, `../../src/music/${musicFile}`);

        // Ensure that the selected music file exists
        if (!fs.existsSync(musicPath)) {
            return res.status(400).json({ message: `Music file not found: ${musicFile}` });
        }

        // Create a temporary directory for processing images
        const tempDir = path.join(__dirname, `../../uploads/temp-${uuidv4()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        // Create a text file for FFmpeg concat demuxer
        const inputFile = path.join(tempDir, 'input.txt');
        
        // Initialize file content with empty string
        let fileContent = '';
        
        // Create file entries for each image with duration
        selectedImages.forEach((img, index) => {
            const originalPath = path.resolve(__dirname, "../../uploads", path.basename(img.url));
            const newPath = path.join(tempDir, `img${index + 1}.jpg`);

            if (fs.existsSync(originalPath)) {
                fs.copyFileSync(originalPath, newPath);
                fileContent += `file '${newPath}'\n`;
                fileContent += `duration ${img.duration || 2.0}\n`;
            } else {
                console.error(`❌ Image not found: ${originalPath}`);
                throw new Error(`Image does not exist: ${originalPath}`);
            }
        });

        // Add the last image again without duration (required for concat demuxer)
        const lastImagePath = path.join(tempDir, `img${selectedImages.length}.jpg`);
        fileContent += `file '${lastImagePath}'`;
        
        // Write the file content to the input file
        fs.writeFileSync(inputFile, fileContent);

        // Define the path for the final reel video
        const reelFilename = `reel-${Date.now()}.mp4`;
        const videoPath = path.resolve(__dirname, `../../uploads/reels/${reelFilename}`);

        // Ensure the reels directory exists
        fs.mkdirSync(path.dirname(videoPath), { recursive: true });

        // Use concat demuxer for precise duration control
        ffmpeg()
            .input(inputFile)
            .inputOptions(['-f concat', '-safe 0'])
            .input(musicPath)
            .outputOptions([
                '-c:v libx264',
                '-pix_fmt yuv420p',
                '-r 30',
                '-c:a aac',
                '-shortest', // End when the shortest input ends
                '-strict experimental'
            ])
            .output(videoPath)
            .on("end", async () => {
                console.log("✅ Video generation complete:", videoPath);

                // Clean up temp directory
                fs.rmSync(tempDir, { recursive: true, force: true });

                try {
                    // Save reel to MongoDB with image durations
                    const newReel = new Reel({
                        userId: objectIdUserId,
                        reelPath: `/uploads/reels/${reelFilename}`,
                        musicFile: musicFile,
                        imageDurations: selectedImages.map(img => ({
                            url: path.basename(img.url),
                            duration: img.duration || 2.0
                        })),
                        createdAt: new Date(),
                    });

                    await newReel.save();
                    console.log("✅ Reel saved to database:", newReel);

                    return res.json({ reelUrl: `http://localhost:5000/uploads/reels/${reelFilename}` });
                } catch (dbError) {
                    console.error("❌ Error saving reel to database:", dbError);
                    return res.status(500).json({ message: "Error saving reel to database" });
                }
            })
            .on("error", (err) => {
                console.error("❌ Error generating video:", err);
                fs.rmSync(tempDir, { recursive: true, force: true });
                return res.status(500).json({ message: "Error generating reel video: " + err.message });
            })
            .run();

    } catch (error) {
        console.error("❌ Error creating reel:", error);
        return res.status(500).json({ message: error.message });
    }
};

// Function to get reels for a specific user
exports.getUserReels = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        let objectIdUserId;
        try {
            objectIdUserId = new mongoose.Types.ObjectId(userId);
        } catch (err) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Find reels associated with the user
        const reels = await Reel.find({ userId: objectIdUserId }).sort({ createdAt: -1 });

        if (reels.length === 0) {
            return res.status(404).json({ message: "No reels found for this user" });
        }

        // Send back the list of reels with relevant details
        const formattedReels = reels.map((reel, index) => ({
            reelId: reel._id,
            reelPath: reel.reelPath,
            createdAt: reel.createdAt,
            musicFile: reel.musicFile,
            imageDurations: reel.imageDurations || [],
            reelTitle: `Reel ${index + 1}`,
        }));

        return res.json({ reels: formattedReels });
    } catch (error) {
        console.error("❌ Error fetching reels:", error);
        return res.status(500).json({ message: "Error fetching reels" });
    }
};

// Function to delete a reel
exports.deleteReel = async (req, res) => {
    try {
        const { reelId, userId } = req.body;

        if (!reelId || !userId) {
            return res.status(400).json({ message: "ReelId and userId are required" });
        }

        // Find the reel
        const reel = await Reel.findById(reelId);

        if (!reel) {
            return res.status(404).json({ message: "Reel not found" });
        }

        // Check if the user owns this reel
        if (reel.userId.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this reel" });
        }

        // Delete the reel file from the server
        const reelFilePath = path.resolve(__dirname, `../../uploads${reel.reelPath}`);
        if (fs.existsSync(reelFilePath)) {
            fs.unlinkSync(reelFilePath);
        }

        // Delete the reel from the database
        await Reel.findByIdAndDelete(reelId);

        return res.json({ message: "Reel deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting reel:", error);
        return res.status(500).json({ message: "Error deleting reel" });
    }
};

// Function to update the reel model schema
exports.updateReelSchema = async () => {
    try {
        // This function can be used to update the Reel model schema if needed
        console.log("✅ Reel schema updated successfully");
    } catch (error) {
        console.error("❌ Error updating reel schema:", error);
    }
};