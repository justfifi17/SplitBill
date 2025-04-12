const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction');
const Group = require('../models/Group');
const CharityPool = require('../models/CharityPool');
// const verifyFirebaseToken = require('../middleware/authMiddleware'); // Currently disabled for testing

/**
 * @swagger
 * /transactions/add:
 *   post:
 *     summary: Add a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - totalAmount
 *               - description
 *             properties:
 *               groupId:
 *                 type: string
 *               totalAmount:
 *                 type: number
 *               description:
 *                 type: string
 *               receiptUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense added successfully
 */
router.post('/add', async (req, res) => {
  const userId = 'test-user-id'; // Replace with real UID in production
  const { groupId, totalAmount, description, receiptUrl } = req.body;

  if (!groupId || !totalAmount || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const members = group.members;
    const numMembers = members.length;
    const perPersonRaw = totalAmount / numMembers;
    const perPersonRounded = Math.floor(perPersonRaw * 100) / 100;

    const totalSplit = perPersonRounded * numMembers;
    const remainingCent = Math.round((totalAmount - totalSplit) * 100) / 100;

    const splitAmong = members.map(uid => ({
      user: uid,
      amount: perPersonRounded
    }));

    const transaction = new Transaction({
      groupId,
      paidBy: userId,
      totalAmount,
      description,
      splitAmong,
      remainingCent,
      resolved: false,
      resolutionType: null,
      receiptUrl: receiptUrl || null
    });

    await transaction.save();

    res.status(201).json({
      message: 'Expense added successfully with split details',
      transaction: {
        id: transaction._id,
        ...transaction._doc
      }
    });
  } catch (err) {
    console.error('Transaction creation failed:', err.message);
    res.status(500).json({
      message: 'Failed to add expense',
      error: err.message
    });
  }
});


/**
 * @swagger
 * /transactions/resolve-cent/{transactionId}:
 *   post:
 *     summary: Resolve leftover cents
 *     tags: [Transactions]
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [donate, game]
 *     responses:
 *       200:
 *         description: Remaining cent resolved
 */
router.post('/resolve-cent/:transactionId', async (req, res) => {
  const userId = 'test-user-id'; // Replace with real UID in production
  const { decision } = req.body;
  const transactionId = req.params.transactionId;

  if (!['donate', 'game'].includes(decision)) {
    return res.status(400).json({ message: "Decision must be either 'donate' or 'game'" });
  }

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.resolved) {
      return res.status(400).json({ message: 'Remaining cent already resolved' });
    }

    let result = {};

    if (decision === 'donate') {
      let pool = await CharityPool.findOne();
      if (!pool) pool = new CharityPool();

      pool.totalCents += Math.round(transaction.remainingCent * 100);
      await pool.save();

      transaction.resolutionType = 'donate';
      transaction.resolved = true;
      await transaction.save();

      result = {
        donated: transaction.remainingCent,
        newCharityTotal: pool.totalCents / 100
      };
    } else {
      const unlucky = transaction.splitAmong[Math.floor(Math.random() * transaction.splitAmong.length)];
      transaction.resolutionType = 'game';
      transaction.resolved = true;
      await transaction.save();

      result = {
        unluckyUser: unlucky.user,
        paysExtra: transaction.remainingCent
      };
    }

    res.status(200).json({
      message: `Remaining cent resolved by '${decision}'`,
      transactionId: transaction._id,
      resolution: result
    });
  } catch (err) {
    console.error('Error resolving leftover cent:', err.message);
    res.status(500).json({
      message: 'Error resolving cent',
      error: err.message
    });
  }
});


module.exports = router;
