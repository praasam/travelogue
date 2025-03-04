const sentimentMusicMap = require("../utils/sentimentMusicMap");

// This part sends a list of possible music tracks based on the sentiment
exports.suggestMusic = (req, res) => {
  try {
      const { sentiment } = req.body;
      console.log("Received sentiment:", sentiment);

      // Check if the sentiment is valid in the map
      if (!sentimentMusicMap[sentiment]) {
          console.log("Sentiment not found in map");
          return res.status(400).json({ message: "Sentiment not found" });
      }

      // Get the music tracks corresponding to the sentiment
      const musicTracks = sentimentMusicMap[sentiment];

      console.log("Suggested tracks:", musicTracks); // Debugging

      // Send back the music tracks as an array
      return res.json({
          suggestedTracks: musicTracks, // This will be an array of music file names
      });

  } catch (error) {
      console.error("Error suggesting music:", error);
      return res.status(500).json({ message: "Error suggesting music" });
  }
};


