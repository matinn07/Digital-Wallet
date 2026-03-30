function startOfUTCDay(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function endOfUTCDay(d = new Date()) {
  const start = startOfUTCDay(d);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

module.exports = { startOfUTCDay, endOfUTCDay };

