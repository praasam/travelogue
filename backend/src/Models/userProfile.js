const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',  // Make sure this matches the name of the model in authUserModel.js
        required: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    address: {
        type: String,
        maxlength: 500
    },
    phone: {
        type: String,
        maxlength: 13
    },
    profileImage: {
        type: String // Store the URL of the uploaded image
    }
}, { timestamps: true }); // Enables createdAt and updatedAt fields

module.exports = mongoose.model('Profile', profileSchema);
