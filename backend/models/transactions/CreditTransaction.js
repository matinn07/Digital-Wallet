const { Transaction } = require('./Transaction');
const { WalletDomain } = require('../domain/WalletDomain');

class CreditTransaction extends Transaction {
  constructor({ amountCents, receiverUserId, meta = null }) {
    super({ amountCents, receiverUserId, meta });
  }

  async processTransaction(service, dbTx) {
    // Add money: credit wallet in a single atomic SQL transaction.
    const walletRow = await service.getWalletLockedByUserId(this.receiverUserId, dbTx);
    const wallet = new WalletDomain(walletRow.balanceCents);
    wallet.credit(this.amountCents);

    await service.updateWalletBalance(walletRow.id, wallet.balanceCents, dbTx);
    const record = await service.createWalletTransactionRecord(
      {
        type: 'CREDIT',
        amountCents: this.amountCents,
        senderUserId: null,
        receiverUserId: this.receiverUserId,
        meta: this.meta,
      },
      dbTx
    );
    return record;
  }
}

module.exports = { CreditTransaction };

