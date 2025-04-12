const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  splitAmount: Number,
  paidBy: { type: String, required: true },
  receiptUrl: { type: String},
  splitAmong: [
    {
      user: { type: String, required: true }, // Firebase UID
      amount: { type: Number, required: true },
    }
  ],
  remainingCent: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false }, // was the extra cent resolved?
  resolutionType: { type: String, enum: ['donate', 'game', null], default: null }
  ,
  extraCentDecision: { type: String, enum: ['donate', 'game'], default: null},
  extraCentWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
