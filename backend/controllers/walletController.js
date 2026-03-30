const { User } = require('../models');
const { WalletService } = require('../services/WalletService');
const { AppError } = require('../utils/errors');
const { parseAmountToCents, formatCentsToDollars } = require('../utils/amount');

function getService() {
  // In interview: you can also inject dependencies, but this is fine for a small service.
  return new WalletService();
}

async function getBalance(req, res, next) {
  try {
    const service = getService();
    const { balanceCents } = await service.getBalance({ userId: req.user.userId });
    res.json({ balanceCents: balanceCents.toString(), balance: formatCentsToDollars(balanceCents) });
  } catch (err) {
    next(err);
  }
}

async function addMoney(req, res, next) {
  try {
    const service = getService();
    const { amount } = req.body || {};
    const amountCents = parseAmountToCents(amount);
    if (!amountCents) throw new AppError('Amount must be a positive number.', 400);

    const record = await service.addMoney({
      userId: req.user.userId,
      amountCents,
      meta: { source: 'add-money' },
    });

    res.status(201).json({ ok: true, transactionId: record.id });
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  try {
    const service = getService();
    const { toEmail, amount, category } = req.body || {};
    if (!toEmail || typeof toEmail !== 'string') throw new AppError('toEmail is required.', 400);

    const amountCents = parseAmountToCents(amount);
    if (!amountCents) throw new AppError('Amount must be a positive number.', 400);

    const receiver = await User.findOne({ where: { email: toEmail.trim().toLowerCase() } });
    if (!receiver) throw new AppError('Receiver not found.', 404);

    const record = await service.transferMoney({
      senderUserId: req.user.userId,
      receiverUserId: receiver.id,
      amountCents,
      meta: { source: 'transfer' },
      category,
    });

    res.status(201).json({ ok: true, transactionId: record.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBalance, addMoney, transfer };

