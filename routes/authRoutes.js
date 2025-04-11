const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const User = require('../models/User'); // MongoDB user model

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *               name:
 *                 type: string
 *                 example: Fithi
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Missing input
 *       500:
 *         description: Server error
 */
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    // 1. Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Save to MongoDB (optional but useful)
    const newUser = new User({
      _id: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

module.exports = router;
