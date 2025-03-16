const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'authusers', required: true },
    reelPath: { type: String, required: true },
    musicFile: { type: String, required: true },  // Add this field to store music file name
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reel', ReelSchema);
