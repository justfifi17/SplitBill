const express = require('express');
const Group = require('../models/Group');
const verifyFirebaseToken = require('../middleware/authMiddleware');
const Invitation = require('../models/Invitation');

const router = express.Router();

/**
 * @swagger
 * /groups/create:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
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
router.post('/create', /*verifyFirebaseToken,*/ async (req, res) => {
  const { groupName } = req.body;
  //const userId = req.user.uid;
  const userId = 'test-user-id'; 

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

/**
 * @swagger
 * /groups/my-groups:
 *   get:
 *     summary: Get groups the user belongs to
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get('/my-groups', /*verifyFirebaseToken,*/ async (req, res) => {
  //const userId = req.user.uid;
  const userId = 'test-user-id'; 

  try {
    const groups = await Group.find({ members: userId });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
  }
});

/**
 * @swagger
 * /groups/join/{groupId}:
 *   post:
 *     summary: Join an existing group
 *     tags: [Groups]
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
router.post('/join/:groupId', /*verifyFirebaseToken,*/ async (req, res) => {
  //const userId = req.user.uid;
  const userId = 'test-user-id'; 
  const groupId = req.params.groupId;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

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

/**
 * @swagger
 * /groups/add-member:
 *   patch:
 *     summary: Add a new member to a group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - memberId
 *             properties:
 *               groupId:
 *                 type: string
 *               memberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added to group
 *       400:
 *         description: User already in group or invalid input
 *       404:
 *         description: Group not found
 */
router.patch('/add-member', async (req, res) => {
  const { groupId, memberId } = req.body;

  if (!groupId || !memberId) {
    return res.status(400).json({ message: 'groupId and memberId are required' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(memberId)) {
      return res.status(400).json({ message: 'User already a member of this group' });
    }

    group.members.push(memberId);
    await group.save();

    res.status(200).json({ message: 'Member added successfully', group });
  } catch (err) {
    res.status(500).json({ message: 'Error adding member', error: err.message });
  }
});

/**
 * @swagger
 * /groups/invite:
 *   post:
 *     summary: Invite a user to join a group by email
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - email
 *             properties:
 *               groupId:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Group not found
 *       409:
 *         description: Already invited
 */

// Invite a user by email
router.post('/invite', async (req, res) => {
  const { groupId, email } = req.body;

  if (!groupId || !email) {
    return res.status(400).json({ message: 'groupId and email are required' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const existingInvite = await Invitation.findOne({ groupId, email });
    if (existingInvite) return res.status(409).json({ message: 'Already invited' });

    const invite = new Invitation({ groupId, email });
    await invite.save();

    res.status(200).json({ message: 'Invitation sent', invite });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


/**
 * @swagger
 * /groups/accept-invite:
 *   post:
 *     summary: Accept an invitation to join a group using email
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - email
 *             properties:
 *               groupId:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined the group
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Invite or group not found
 *       409:
 *         description: Already a group member
 */

/**
 * @swagger
 * /groups/accept-invite:
 *   post:
 *     summary: Accept an invitation to join a group using email
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - email
 *             properties:
 *               groupId:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined the group
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Invite or group not found
 *       409:
 *         description: Already a group member
 */

// Accept an invite by email
router.post('/accept-invite', async (req, res) => {
  const { groupId, email } = req.body;

  if (!groupId || !email) {
    return res.status(400).json({ message: 'groupId and email are required' });
  }

  try {
    const invite = await Invitation.findOne({ groupId, email, status: 'pending' });
    if (!invite) return res.status(404).json({ message: 'No invite found' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.members.includes(email)) {
      return res.status(409).json({ message: 'Already a group member' });
    }

    group.members.push(email);
    await group.save();

    invite.status = 'accepted';
    await invite.save();

    res.status(200).json({ message: 'You joined the group', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;
