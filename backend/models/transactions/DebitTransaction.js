const { Transaction } = require('./Transaction');
const { WalletDomain } = require('../domain/WalletDomain');

class DebitTransaction extends Transaction {
  constructor({ amountCents, senderUserId, meta = null }) {
    super({ amountCents, senderUserId, meta });
  }

  async processTransaction(service, dbTx) {
    // Send money: debit wallet in a consistent, locked SQL transaction.
    const walletRow = await service.getWalletLockedByUserId(this.senderUserId, dbTx);
    const wallet = new WalletDomain(walletRow.balanceCents);
    wallet.debit(this.amountCents);

    await service.updateWalletBalance(walletRow.id, wallet.balanceCents, dbTx);
    const record = await service.createWalletTransactionRecord(
      {
        type: 'DEBIT',
        amountCents: this.amountCents,
        senderUserId: this.senderUserId,
        receiverUserId: null,
        meta: this.meta,
      },
      dbTx
    );
    return record;
  }
}

module.exports = { DebitTransaction };

