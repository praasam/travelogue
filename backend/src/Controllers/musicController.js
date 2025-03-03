const path = require("path");

const suggestMusic = (req, res) => {
  const { sentiment } = req.body;

  const musicMap = {
      Happy: "happy.mp3",
      Sad: "sad.mp3",
      Angry: "angry.mp3",
      Neutral: "neutral.mp3",
  };

  const musicFile = musicMap[sentiment] || "neutral.mp3";
  const musicUrl = `http://localhost:5000/music/${musicFile}`; // Construct full URL

  return res.json({ suggestedTracks: [musicUrl] });
};

module.exports = { suggestMusic };

