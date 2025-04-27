const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Multer setup for uploading profile pics
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Signup
 */
router.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { name, email, password, securityQuestion, securityAnswer } = req.body;

  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic: req.file ? req.file.filename : '',
      securityQuestion,
      securityAnswer,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token }); // ✅ Always send token after signup
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

/**
 * Login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token }); // ✅ Very important: always send token
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * Forgot Password Step 1: Get security question
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ securityQuestion: user.securityQuestion });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Forgot Password Step 2: Verify answer and reset password
 */
router.post('/reset-password', async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.securityAnswer !== securityAnswer) {
      return res.status(400).json({ error: 'Invalid answer or email' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update Profile Picture
 */
router.post('/update-profile-pic', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      profilePic: req.file.filename,
    }, { new: true });

    res.json({ message: 'Profile picture updated', profilePic: `/uploads/${user.profilePic}` });
  } catch (err) {
    console.error('Update profile pic error:', err);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
});

/**
 * Get Current User
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.profilePic && !user.profilePic.startsWith('http')) {
      user.profilePic = `${req.protocol}://${req.get('host')}/uploads/${user.profilePic}`;
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
