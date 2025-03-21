const User = require('../Models/authUserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Profile = require('../Models/userProfile');
dotenv.config();

const registerUser = async (req, res) => {
  const { name, email, password, role, address, phone } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    // Create a profile for the new user
    const newProfile = new Profile({
      user: user._id,
      bio: "",
      address: "",
      phone:  "",
      profileImage: "",
    });

    await newProfile.save();

    res.status(201).json({
      msg: "User registered successfully",
      user,
      userProfile: newProfile,
    });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const payload = {
      user: {
        id: user.id,
        role: user.role
      },
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ msg: "User logged in successfully", token, user: user, id: user.id });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 1. First, let's add a changePassword function to your auth controller
// Add this to your authController.js file

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; // This comes from the auth middleware

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the updated user
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update the exports to include the new function
module.exports = {
  registerUser,
  loginUser,
  changePassword
};

