const { sequelize, User, Wallet, WalletTransactionRecord } = require('../models');
const { Sequelize } = require('../config/db');
const { Op } = require('sequelize');

const { startOfUTCDay, endOfUTCDay } = require('../utils/date');
const { AppError } = require('../utils/errors');

const { CreditTransaction } = require('../models/transactions/CreditTransaction');
const { DebitTransaction } = require('../models/transactions/DebitTransaction');
const { TransferTransaction } = require('../models/transactions/TransferTransaction');

class WalletService {
  async runTransaction(transactionInstance) {
    // ACID: the whole operation is wrapped in ONE DB transaction.
    // Isolation: SERIALIZABLE (strictest practical guarantees).
    return sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE },
      async (dbTx) => {
        return transactionInstance.processTransaction(this, dbTx);
      }
    );
  }

  async getWalletLockedByUserId(userId, dbTx) {
    const walletRow = await Wallet.findOne({
      where: { userId },
      transaction: dbTx,
      lock: dbTx.LOCK.UPDATE,
    });

    if (!walletRow) throw new AppError('Wallet not found.', 404);
    return walletRow;
  }

  async lockWalletRowsForTransfer(senderUserId, receiverUserId, dbTx) {
    // Lock ordering by wallet.id reduces deadlock risk.
    const sender = await Wallet.findOne({
      where: { userId: senderUserId },
      transaction: dbTx,
    });
    const receiver = await Wallet.findOne({
      where: { userId: receiverUserId },
      transaction: dbTx,
    });

    if (!sender) throw new AppError('Sender wallet not found.', 404);
    if (!receiver) throw new AppError('Receiver wallet not found.', 404);

    const [first, second] = sender.id < receiver.id ? [sender, receiver] : [receiver, sender];

    const firstLocked = await Wallet.findOne({
      where: { id: first.id },
      transaction: dbTx,
      lock: dbTx.LOCK.UPDATE,
    });
    const secondLocked = await Wallet.findOne({
      where: { id: second.id },
      transaction: dbTx,
      lock: dbTx.LOCK.UPDATE,
    });

    return {
      senderWalletRow: first.id === sender.id ? firstLocked : secondLocked,
      receiverWalletRow: first.id === receiver.id ? firstLocked : secondLocked,
    };
  }

  async updateWalletBalance(walletId, newBalanceCents, dbTx) {
    // Consistency: domain logic prevents negative balance; DB CHECK constraint
    // prevents any accidental inconsistency.
    const [affectedRows] = await Wallet.update(
      { balanceCents: newBalanceCents },
      { where: { id: walletId }, transaction: dbTx }
    );

    if (affectedRows !== 1) {
      throw new AppError('Failed to update wallet balance.', 500);
    }
  }

  async createWalletTransactionRecord(payload, dbTx) {
    return WalletTransactionRecord.create(
      {
        type: payload.type,
        amountCents: payload.amountCents,
        senderUserId: payload.senderUserId,
        receiverUserId: payload.receiverUserId,
        meta: payload.meta || null,
        category: payload.category || null,
      },
      { transaction: dbTx }
    );
  }

  async enforceDailyTransferLimit(senderUserId, amountCents, dbTx) {
    const user = await User.findOne({ where: { id: senderUserId }, transaction: dbTx });
    if (!user) throw new AppError('User not found.', 404);

    const limitCents = BigInt(user.dailyTransferLimitCents);
    const amount = BigInt(amountCents);

    const start = startOfUTCDay(new Date());
    const end = endOfUTCDay(new Date());

    const totalSent = await WalletTransactionRecord.sum('amountCents', {
      where: {
        senderUserId,
        type: 'TRANSFER',
        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      transaction: dbTx,
    });

    const totalSentCents = totalSent ? BigInt(totalSent) : 0n;
    if (totalSentCents + amount > limitCents) {
      throw new AppError('Daily transfer limit exceeded.', 400, {
        limitCents: limitCents.toString(),
        attemptedCents: (totalSentCents + amount).toString(),
      });
    }
  }

  // Public API used by controllers.
  async addMoney({ userId, amountCents, meta = null }) {
    const tx = new CreditTransaction({ amountCents, receiverUserId: userId, meta });
    return this.runTransaction(tx);
  }

  async transferMoney({ senderUserId, receiverUserId, amountCents, meta = null, category = null }) {
    if (senderUserId === receiverUserId) {
      throw new AppError('Cannot transfer to yourself.', 400);
    }
    const tx = new TransferTransaction({
      amountCents,
      senderUserId,
      receiverUserId,
      meta,
      category,
    });
    return this.runTransaction(tx);
  }

  // Balance reads do not require locking.
  async getBalance({ userId }) {
    const walletRow = await Wallet.findOne({ where: { userId } });
    if (!walletRow) throw new AppError('Wallet not found.', 404);
    const raw = walletRow.balanceCents;
    const balanceCents = typeof raw === 'bigint' ? raw : BigInt(raw);
    return { balanceCents, walletId: walletRow.id };
  }

  // Example: debit-money only path (kept for interview completeness).
  async debitMoney({ userId, amountCents, meta = null }) {
    const tx = new DebitTransaction({ amountCents, senderUserId: userId, meta });
    return this.runTransaction(tx);
  }
}

module.exports = { WalletService };

