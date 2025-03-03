const mongoose = require("mongoose");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const Reel = require("../Models/reelModel"); // Import Reel model
const sentimentMusicMap = require("../utils/sentimentMusicMap"); // Add a module to map sentiments to music

ffmpeg.setFfmpegPath(ffmpegPath);

exports.createReel = async (req, res) => {
    try {
        const { userId, selectedImageUrls, sentiment } = req.body;

        // Validate userId and sentiment
        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        let objectIdUserId;
        try {
            objectIdUserId = new mongoose.Types.ObjectId(userId);
        } catch (err) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        if (!selectedImageUrls || selectedImageUrls.length < 2) {
            return res.status(400).json({ message: "At least 2 images are required to create a reel" });
        }

        if (!sentiment) {
            return res.status(400).json({ message: "Sentiment is required to suggest music" });
        }

        // Get the music suggestion based on sentiment
        const musicTrack = sentimentMusicMap[sentiment];
        if (!musicTrack) {
            return res.status(400).json({ message: "No music found for the selected sentiment" });
        }

        // Create a temporary directory for processing images
        const tempDir = path.join(__dirname, `../../uploads/temp-${uuidv4()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        // Copy images to temp directory with sequential names
        selectedImageUrls.forEach((url, index) => {
            const originalPath = path.resolve(__dirname, "../../uploads", path.basename(url));
            const newPath = path.join(tempDir, `img${index + 1}.jpg`);

            if (fs.existsSync(originalPath)) {
                fs.copyFileSync(originalPath, newPath);
            } else {
                console.error(`❌ Image not found: ${originalPath}`);
                throw new Error(`Image does not exist: ${originalPath}`);
            }
        });

        // Define output path for the reel
        const reelFilename = `reel-${Date.now()}.mp4`;
        const videoPath = path.resolve(__dirname, `../../uploads/reels/${reelFilename}`);

        // Define path for the music track (located in backend/src/music)
        const musicPath = path.resolve(__dirname, `../../src/music/${musicTrack}`);

        // Process images into a slideshow video with the selected music
        ffmpeg()
            .input(path.join(tempDir, "img%d.jpg"))
            .inputOptions("-framerate 1")
            .input(musicPath)  // Add music track to the video
            .outputOptions([
                "-c:v libx264",
                "-pix_fmt yuv420p",
                "-r 30",
                `-t ${selectedImageUrls.length}`,
                "-c:a aac",  // Audio codec
                "-strict experimental",  // Allows experimental audio encoding
            ])
            .output(videoPath)
            .on("end", async () => {
                console.log("✅ Video generation complete:", videoPath);

                // Cleanup temp directory
                fs.rmSync(tempDir, { recursive: true, force: true });

                try {
                    // Save reel to MongoDB
                    const newReel = new Reel({
                        userId: objectIdUserId, // Use converted ObjectId
                        reelPath: `/uploads/reels/${reelFilename}`,
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
                // Clean up temp directory on error
                fs.rmSync(tempDir, { recursive: true, force: true });
                return res.status(500).json({ message: "Error generating reel video" });
            })
            .run();

    } catch (error) {
        console.error("❌ Error creating reel:", error);
        return res.status(500).json({ message: error.message });
    }
};

// Function to get reels for a specific user
// Fetch the reels for the specific user
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
      const reels = await Reel.find({ userId: objectIdUserId });

      if (reels.length === 0) {
          return res.status(404).json({ message: "No reels found for this user" });
      }

      // Send back the list of reels with relevant details
      const formattedReels = reels.map((reel, index) => ({
          reelId: reel._id,
          reelPath: reel.reelPath,
          createdAt: reel.createdAt,
          reelTitle: `Reel ${index + 1}`, // You can change this to a custom title if needed
      }));

      return res.json({ reels: formattedReels });
  } catch (error) {
      console.error("❌ Error fetching reels:", error);
      return res.status(500).json({ message: "Error fetching reels" });
  }
};

