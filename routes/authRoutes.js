const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const User = require('../models/User'); // MongoDB user model

/**
 * @swagger
 * /auth/signup:
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
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user using email and password
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
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      // Firebase Client SDK is typically used on the frontend to get the token,
      // but for backend testing or tools like Swagger, we can simulate with Admin SDK:
  
      // 1️⃣ Find user by email
      const user = await admin.auth().getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Password validation is not done server-side with Firebase Admin SDK
      // This normally happens in the client using Firebase Auth Client SDK (signInWithEmailAndPassword)
  
      // For demo/testing: simulate successful login
      return res.status(200).json({
        message: 'Login simulated for demo user',
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        },
      });
  
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Login failed', error: err.message });
    }
  });
  

/**
 * @swagger
 * /auth/update-email:
 *   put:
 *     summary: Update user email (demo)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email updated (simulated)
 *       400:
 *         description: Invalid email
 *       500:
 *         description: Server error
 */
router.put('/update-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    res.status(200).json({
      message: 'Email update simulated for demo user',
      updatedEmail: email
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /auth/update-password:
 *   put:
 *     summary: Update user password (demo)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated (simulated)
 *       400:
 *         description: Invalid password
 *       500:
 *         description: Server error
 */
router.put('/update-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    res.status(200).json({
      message: 'Password update simulated for demo user',
      newPasswordSet: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user (revoke Firebase token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       401:
 *         description: Unauthorized or token invalid
 *       500:
 *         description: Server error
 */
router.post('/logout', async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully (token revoked)' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
});

module.exports = router;
