// In reelModel.js
const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  reelPath: {
    type: String,
    required: true
  },
  musicFile: {
    type: String,
    required: true
  },
  musicTrim: {
    startTime: Number,
    duration: Number
  },
  imageDurations: [{
    imageUrl: String,
    duration: Number
  }],
  sentiment: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reel = mongoose.model("Reel", reelSchema);

module.exports = Reel;