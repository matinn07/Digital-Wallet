const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { listTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.get('/transactions', authMiddleware, listTransactions);

module.exports = router;

