const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// ✅ Multer config (with folder safety)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }); // safer
      }
      cb(null, uploadPath);
    } catch (err) {
      console.error('Upload directory creation error:', err);
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

/**
 * Signup Route
 */
router.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { name, email, password, securityQuestion, securityAnswer } = req.body;

  // ✅ Log incoming request
  console.log('Incoming signup data:', {
    name, email, securityQuestion, securityAnswer,
    profilePic: req.file?.filename
  });

  // ✅ Basic validation
  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // ✅ Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

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
    res.status(201).json({ token });
  } catch (err) {
    // ✅ Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already in use (duplicate)' });
    }

    console.error('Signup error:', err.stack || err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

module.exports = router;
