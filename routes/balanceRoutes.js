const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware'); // for req.user.uid

router.get('/my-balance', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;

    const transactions = await Transaction.find({
      $or: [
        { paidBy: userId },
        { splitAmong: userId }
      ]
    });

    let owed = 0;
    let owes = 0;

    transactions.forEach(tx => {
      const numPeople = tx.splitAmong.length;
      const individualShare = tx.totalAmount / numPeople;

      if (tx.paidBy === userId) {
        // You paid for others → they owe you
        owed += individualShare * (numPeople - 1);
      } else if (tx.splitAmong.includes(userId)) {
        // You are part of the split but didn't pay → you owe the payer
        owes += individualShare;
      }
    });

    const total = owed - owes;

    res.json({ total, owed, owes });
  } catch (err) {
    console.error('Error calculating balance:', err);
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
});

module.exports = router;
