const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const expense = new Expense({ title, amount, category, date });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/expenses/summary?month=YYYY-MM
router.get('/summary/month', async (req, res) => {
  try {
    const { month } = req.query; // expected YYYY-MM
    let start, end;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      start = new Date(y, m - 1, 1);
      end = new Date(y, m, 1);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    const result = await Expense.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const { total = 0, count = 0 } = result[0] || {};
    res.json({ total, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
