const { Op } = require('sequelize');
const { User, WalletTransactionRecord } = require('../models');
const { formatCentsToDollars } = require('../utils/amount');

async function listTransactions(req, res, next) {
  try {
    const userId = req.user.userId;
    const { category } = req.query;
    const where = {
      [Op.or]: [{ senderUserId: userId }, { receiverUserId: userId }],
    };
    if (category) {
      where.category = { [Op.iLike]: category };
    }
    const txs = await WalletTransactionRecord.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
      include: [
        { model: User, as: 'sender', attributes: ['email'] },
        { model: User, as: 'receiver', attributes: ['email'] },
      ],
    });


    const mapped = txs.map((t) => {
      const senderEmail = t.sender ? t.sender.email : null;
      const receiverEmail = t.receiver ? t.receiver.email : null;
      return {
        id: t.id,
        type: t.type,
        amountCents: t.amountCents.toString(),
        amount: formatCentsToDollars(t.amountCents),
        senderEmail,
        receiverEmail,
        createdAt: t.createdAt,
        meta: t.meta,
        category: t.category || null,
      };
    });

    res.json({ transactions: mapped });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTransactions };

