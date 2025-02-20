const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Generate unique temp folder names
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

exports.createReel = async (req, res) => {
  try {
    const { userId, selectedImageUrls } = req.body;

    if (!userId || !selectedImageUrls || selectedImageUrls.length < 2) {
      return res.status(400).json({ message: "At least 2 images are required to create a reel" });
    }

    // Create a temp directory for processing images
    const tempDir = path.join(__dirname, `../../uploads/temp-${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Copy images to temp directory with sequential names
    selectedImageUrls.forEach((url, index) => {
      const originalPath = path.resolve(__dirname, '../../uploads/', path.basename(url));
      const newPath = path.join(tempDir, `img${index + 1}.jpg`);
      
      if (fs.existsSync(originalPath)) {
        fs.copyFileSync(originalPath, newPath);
      } else {
        throw new Error(`Image does not exist: ${originalPath}`);
      }
    });

    // Define output path
    const videoPath = path.resolve(__dirname, `../../uploads/reels/reel-${Date.now()}.mp4`);

    // Process images as a slideshow video
    ffmpeg()
      .input(path.join(tempDir, 'img%d.jpg')) // Use numerical sequence
      .inputOptions('-framerate 1') // 1 second per image
      .outputOptions([
        '-c:v libx264',      // Encode in H.264 format
        '-pix_fmt yuv420p',  // Ensure compatibility
        '-r 30',             // 30 FPS for smoothness
        '-t', `${selectedImageUrls.length}` // Set duration dynamically
      ])
      .output(videoPath)
      .on('end', () => {
        console.log('Video generation complete:', videoPath);
        fs.rmSync(tempDir, { recursive: true, force: true }); // Clean up temp files
        res.json({ reelUrl: `http://localhost:5000/uploads/reels/${path.basename(videoPath)}` });
      })
      .on('error', (err) => {
        console.error('Error generating video:', err);
        res.status(500).json({ message: "Error generating reel video" });
      })
      .run();

  } catch (error) {
    console.error("Error creating reel:", error);
    res.status(500).json({ message: error.message });
  }
};
