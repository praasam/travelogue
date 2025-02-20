const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "authusers", // Referencing the User model
    required: true,
  },
  reelPath: {
    type: String,
    required: true, // Store the path to the generated reel
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Reel = mongoose.model("Reel", reelSchema);

module.exports = Reel;
