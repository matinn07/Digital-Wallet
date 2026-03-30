class Transaction {
  constructor({ amountCents, senderUserId = null, receiverUserId = null, meta = null }) {
    this.amountCents = BigInt(amountCents);
    this.senderUserId = senderUserId;
    this.receiverUserId = receiverUserId;
    this.meta = meta;
  }

  // Polymorphic entry point: each derived class enforces its own rules.
  // `service` and `dbTx` are provided so all DB changes happen under one SQL transaction.
  async processTransaction(_service, _dbTx) {
    throw new Error('processTransaction() must be implemented by derived classes.');
  }
}

module.exports = { Transaction };

