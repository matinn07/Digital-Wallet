const express = require('express');

const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');
const transactionRoutes = require('./transactionRoutes');
const profileRoutes = require('./profileRoutes');

const router = express.Router();

router.use(authRoutes);
router.use(walletRoutes);
router.use(transactionRoutes);
router.use('/profile', profileRoutes);

module.exports = router;

