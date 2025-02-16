const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  images: { type: [String], required: true },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "authusers",  // Reference to your users
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;