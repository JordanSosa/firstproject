export const BIN_TYPES = Object.freeze({
  RED:    { key: 'RED',    name: 'General waste', emoji: '🗑️', color: '#D32F2F' },
  YELLOW: { key: 'YELLOW', name: 'Recycling',     emoji: '♻️', color: '#FBC02D' },
  GREEN:  { key: 'GREEN',  name: 'Green waste',   emoji: '🌱', color: '#388E3C' },
  FOGO:   { key: 'FOGO',   name: 'FOGO',          emoji: '🥬', color: '#6D4C41' },
});

export const CADENCE = Object.freeze({ WEEKLY: 'WEEKLY', FORTNIGHTLY: 'FORTNIGHTLY' });

export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MS_PER_DAY = 86_400_000;

function toUtcMidnight(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function isoDay(dateMillis) {
  const d = new Date(dateMillis);
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const js = new Date(utc).getUTCDay();
  return js === 0 ? 7 : js;
}

function addDaysIso(isoDate, days) {
  const millis = toUtcMidnight(isoDate) + days * MS_PER_DAY;
  const d = new Date(millis);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isOutOn(rule, isoDate) {
  if (rule.cadence === CADENCE.WEEKLY) return true;
  if (rule.cadence !== CADENCE.FORTNIGHTLY) return false;
  if (!rule.referenceIsoDate) return false;
  const days = Math.round(
    (toUtcMidnight(isoDate) - toUtcMidnight(rule.referenceIsoDate)) / MS_PER_DAY
  );
  const weeks = Math.abs(Math.round(days / 7));
  return weeks % 2 === 0;
}

export function binsScheduledFor(config, isoDate) {
  if (isoDay(toUtcMidnight(isoDate)) !== config.collectionDayValue) return [];
  return config.rules
    .filter((rule) => isOutOn(rule, isoDate))
    .map((rule) => rule.type);
}

export function nextCollectionOnOrAfter(config, fromIsoDate) {
  if (!config.rules || config.rules.length === 0) return null;
  let candidate = fromIsoDate;
  for (let i = 0; i < 14; i++) {
    const bins = binsScheduledFor(config, candidate);
    if (bins.length > 0) return { date: candidate, bins };
    candidate = addDaysIso(candidate, 1);
  }
  return null;
}

export function upcomingCollections(config, fromIsoDate, count = 52) {
  const results = [];
  let candidate = fromIsoDate;
  const maxDays = count * 14;
  for (let i = 0; i < maxDays && results.length < count; i++) {
    const bins = binsScheduledFor(config, candidate);
    if (bins.length > 0) results.push({ date: candidate, bins });
    candidate = addDaysIso(candidate, 1);
  }
  return results;
}

export function todayIso(now = new Date()) {
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
