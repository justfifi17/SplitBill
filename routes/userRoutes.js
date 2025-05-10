// In routes/userRoutes.js or wherever appropriate
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // adjust path based on your project structure

// POST /api/users/emails-by-uid
router.post('/emails-by-uid', async (req, res) => {
  try {
    const { uids } = req.body;

    if (!Array.isArray(uids)) {
      return res.status(400).json({ error: 'Invalid input: uids must be an array.' });
    }

    const users = await User.find({ uid: { $in: uids } }, 'email');
    const emails = users.map(user => user.email);

    res.json(emails);
  } catch (error) {
    console.error('Error fetching user emails:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
