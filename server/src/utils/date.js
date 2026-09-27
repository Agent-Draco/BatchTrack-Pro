function todayPlusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

function daysFromNow(isoDate) {
  const target = new Date(isoDate);
  const now = new Date();
  target.setHours(12, 0, 0, 0);
  now.setHours(12, 0, 0, 0);
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

module.exports = { todayPlusDays, daysFromNow };
