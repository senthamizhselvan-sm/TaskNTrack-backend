const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'Other' },
  date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
