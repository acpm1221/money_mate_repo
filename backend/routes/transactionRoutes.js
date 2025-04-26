const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { userId } = jwt.verify(token, JWT_SECRET);
        req.userId = userId;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Create Transaction
router.post('/', auth, async (req, res) => {
    const { title, type, amount, date, category, description } = req.body;
    try {
        const transaction = await Transaction.create({
            userId: req.userId,
            title,
            type,
            amount,
            date,
            category,
            description
        });
        res.json(transaction);
    } catch (err) {
        console.error('Transaction creation error:', err);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Get All Transactions for User
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Delete Transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        const deleted = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!deleted) return res.status(404).json({ error: 'Transaction not found' });

        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
