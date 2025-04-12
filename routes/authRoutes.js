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

/**
 * @swagger
 * /auth/update-email:
 *   put:
 *     summary: Update user email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
 *         description: Email updated
 *       400:
 *         description: Invalid email
 *       401:
 *         description: Unauthorized
 */
router.put('/update-email', verifyFirebaseToken, async (req, res) => {
    const { email } = req.body;
  
    if (!email) return res.status(400).json({ message: 'Email is required' });
  
    try {
      const user = await admin.auth().updateUser(req.user.uid, { email });
      res.status(200).json({ message: 'Email updated', user });
    } catch (err) {
      console.error('Update email error:', err);
      res.status(500).json({ message: 'Failed to update email', error: err.message });
    }
  });

  
/**
 * @swagger
 * /auth/update-password:
 *   put:
 *     summary: Update user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
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
 *         description: Password updated
 *       400:
 *         description: Invalid password
 *       401:
 *         description: Unauthorized
 */
router.put('/update-password', verifyFirebaseToken, async (req, res) => {
    const { password } = req.body;
  
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
  
    try {
      const user = await admin.auth().updateUser(req.user.uid, { password });
      res.status(200).json({ message: 'Password updated successfully', user });
    } catch (err) {
      console.error('Update password error:', err);
      res.status(500).json({ message: 'Failed to update password', error: err.message });
    }
  });
  

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user (revoke Firebase token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       401:
 *         description: Unauthorized or token invalid
 *       500:
 *         description: Server error
 */
router.post('/logout', verifyFirebaseToken, async (req, res) => {
    try {
      await admin.auth().revokeRefreshTokens(req.user.uid);
      res.status(200).json({ message: 'Logged out successfully (token revoked)' });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ message: 'Logout failed', error: err.message });
    }
  });

module.exports = router;
