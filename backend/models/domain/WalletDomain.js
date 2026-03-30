class WalletDomain {
  #balanceCents;

  constructor(balanceCents) {
    this.#balanceCents = BigInt(balanceCents);
  }

  get balanceCents() {
    return this.#balanceCents;
  }

  credit(amountCents) {
    const amt = BigInt(amountCents);
    if (amt <= 0n) throw new Error('Credit amount must be positive.');
    this.#balanceCents = this.#balanceCents + amt;
    return this.#balanceCents;
  }

  debit(amountCents) {
    const amt = BigInt(amountCents);
    if (amt <= 0n) throw new Error('Debit amount must be positive.');
    if (this.#balanceCents < amt) throw new Error('Insufficient balance.');
    this.#balanceCents = this.#balanceCents - amt;
    return this.#balanceCents;
  }
}

module.exports = { WalletDomain };

