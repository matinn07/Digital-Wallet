const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getBalance, addMoney, transfer } = require('../controllers/walletController');

const router = express.Router();

router.get('/balance', authMiddleware, getBalance);
router.post('/add-money', authMiddleware, addMoney);
router.post('/transfer', authMiddleware, transfer);

module.exports = router;

