const express = require('express');
const Group = require('../models/Group');
const verifyFirebaseToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /groups/create:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - firebaseAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupName:
 *                 type: string
 *                 example: Beach Trip
 *     responses:
 *       201:
 *         description: Group created
 */
router.post('/create', authenticate, createGroup);

/**
 * @swagger
 * /groups/my-groups:
 *   get:
 *     summary: Get groups the user belongs to
 *     tags: [Groups]
 *     security:
 *       - firebaseAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get('/my-groups', authenticate, getMyGroups);

/**
 * @swagger
 * /groups/join/{groupId}:
 *   post:
 *     summary: Join an existing group
 *     tags: [Groups]
 *     security:
 *       - firebaseAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joined successfully
 */
router.post('/join/:groupId', authenticate, joinGroup);


//Create a new group
router.post('/create', verifyFirebaseToken, async (req, res) => {
  const { groupName } = req.body;
  const userId = req.user.uid; // Firebase user UID

  try {
    const newGroup = new Group({
      groupName,
      members: [userId],
    });

    await newGroup.save();

    res.status(201).json({
      message: 'Group created successfully',
      group: newGroup,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
});

//Get all groups the user belongs to
router.get('/my-groups', verifyFirebaseToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    const groups = await Group.find({ members: userId });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
  }
});

module.exports = router;

// Join an existing group
router.post('/join/:groupId', verifyFirebaseToken, async (req, res) => {
    const userId = req.user.uid; // Firebase UID
    const groupId = req.params.groupId;
  
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Prevent adding the same user twice
      if (group.members.includes(userId)) {
        return res.status(400).json({ message: 'User already a member of this group' });
      }
  
      group.members.push(userId);
      await group.save();
  
      res.status(200).json({ message: 'User added to group', group });
    } catch (err) {
      res.status(500).json({ message: 'Failed to join group', error: err.message });
    }
  });

  // Get all groups that the current user is part of
router.get('/my-groups', verifyFirebaseToken, async (req, res) => {
    const userId = req.user.uid; // Firebase UID from verified token
  
    try {
      const groups = await Group.find({ members: userId });
      res.status(200).json(groups);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
    }
  });
  
