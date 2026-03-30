function parseAmountToCents(input) {
  // Accept strings or numbers.
  const n = typeof input === 'string' ? Number(input) : input;
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;

  // Round to nearest cent.
  // Use BigInt for BIGINT cents safety.
  return BigInt(Math.round(n * 100));
}

function formatCentsToDollars(cents) {
  const c = typeof cents === 'bigint' ? cents : BigInt(cents);
  const sign = c < 0n ? '-' : '';
  const abs = c < 0n ? -c : c;
  const whole = abs / 100n;
  const rem = abs % 100n;
  const remStr = rem.toString().padStart(2, '0');
  return `${sign}${whole.toString()}.${remStr}`;
}

module.exports = { parseAmountToCents, formatCentsToDollars };

