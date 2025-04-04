const mongoose = require('mongoose');

const CharityPoolSchema = new mongoose.Schema({
  totalCents: { type: Number, default: 0 },
  totalDonated: { type: Number, default: 0 },
  lastDonationDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('CharityPool', CharityPoolSchema);
