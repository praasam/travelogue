const User = require('../Models/authUserModel');
const UserProfile = require('../Models/userProfile');

// Controller to get the user's profile
exports.getProfile = async (req, res) => {
  try {
    // Find the user first
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the profile associated with the user
    const profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      // If no profile exists, create one
      const newProfile = new UserProfile({
        user: req.user.id
      });
      
      await newProfile.save();
      
      // Return user data with empty profile
      return res.json({
        // User data
        username: user.name,
        email: user.email,
        role: user.role,
        
        // Profile data (with defaults)
        profileImage: '',
        bio: '',
        address: '',
        phone: '',
        // Add any other fields your UserProfile model has
      });
    }
    
    // Return user data combined with profile data
    res.json({
      // User data
      username: user.name,
      email: user.email,
      role: user.role,
      
      // Profile data
      profileImage: profile.profileImage || '',
      bio: profile.bio || '',
      address: profile.address || '',
      phone: profile.phone || '',
      // Include all other fields from your UserProfile model
      ...profile._doc
    });
    
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Controller for uploading the profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-images/${req.file.filename}`;
    
    // Find and update the profile
    let profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Create profile if it doesn't exist
      profile = new UserProfile({
        user: req.user.id,
        profileImage: imageUrl
      });
    } else {
      profile.profileImage = imageUrl;
    }
    
    await profile.save();
    
    res.json({ profileImage: profile.profileImage });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: 'Error uploading profile image' });
  }
};

// Add a new controller to update profile fields
exports.updateProfile = async (req, res) => {
  try {
    const { bio, address, phone, username, profileImage } = req.body;
    // Note: We're not extracting email from req.body anymore
    
    // Find the profile associated with the user
    let profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      // If no profile exists, create a new one
      profile = new UserProfile({
        user: req.user.id,
        bio,
        address,
        phone,
        profileImage,
      });
    } else {
      // Update existing profile fields
      profile.bio = bio || profile.bio;
      profile.address = address || profile.address;
      profile.phone = phone || profile.phone;
      profile.profileImage = profileImage || profile.profileImage;
    }
    
    // Update the associated user details (username only)
    const user = await User.findById(req.user.id);
    if (user) {
      user.username = username || user.username;
      // Don't update email even if provided
      await user.save();
    }
    
    await profile.save();
    res.json({ profile, user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};





