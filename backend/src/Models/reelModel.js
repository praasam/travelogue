const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  reelPath: {
    type: String,
    required: true
  },
  musicFile: {
    type: String,
    required: true
  },
  imageDurations: [
    {
      url: String,
      duration: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reel = mongoose.model("Reel", reelSchema);

module.exports = Reel;