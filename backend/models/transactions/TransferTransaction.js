const { Transaction } = require('./Transaction');
const { WalletDomain } = require('../domain/WalletDomain');


class TransferTransaction extends Transaction {
  constructor({ amountCents, senderUserId, receiverUserId, meta = null, category = null }) {
    super({ amountCents, senderUserId, receiverUserId, meta });
    this.category = category;
  }

  async processTransaction(service, dbTx) {
    // Fraud prevention + atomic sender debit + receiver credit.
    await service.enforceDailyTransferLimit(this.senderUserId, this.amountCents, dbTx);

    const {
      senderWalletRow,
      receiverWalletRow,
    } = await service.lockWalletRowsForTransfer(
      this.senderUserId,
      this.receiverUserId,
      dbTx
    );

    // Encapsulation: wallet balances are updated only via WalletDomain methods.
    const senderWallet = new WalletDomain(senderWalletRow.balanceCents);
    const receiverWallet = new WalletDomain(receiverWalletRow.balanceCents);

    senderWallet.debit(this.amountCents);
    receiverWallet.credit(this.amountCents);

    // ACID: both wallet updates + transaction record are inside ONE SQL transaction.
    await service.updateWalletBalance(senderWalletRow.id, senderWallet.balanceCents, dbTx);
    await service.updateWalletBalance(receiverWalletRow.id, receiverWallet.balanceCents, dbTx);


    const record = await service.createWalletTransactionRecord(
      {
        type: 'TRANSFER',
        amountCents: this.amountCents,
        senderUserId: this.senderUserId,
        receiverUserId: this.receiverUserId,
        meta: this.meta,
        category: this.category,
      },
      dbTx
    );

    return record;
  }
}

module.exports = { TransferTransaction };

