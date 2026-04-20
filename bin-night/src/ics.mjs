import { BIN_TYPES } from './schedule.mjs';

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatLocalDateTime(isoDate, hour, minute) {
  const [y, m, d] = isoDate.split('-');
  return `${y}${m}${d}T${pad(hour)}${pad(minute)}00`;
}

function formatUtcStamp(date = new Date()) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcsText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  if (line.length <= 75) return line;
  const chunks = [];
  let i = 0;
  while (i < line.length) {
    chunks.push((i === 0 ? '' : ' ') + line.slice(i, i + (i === 0 ? 75 : 74)));
    i += i === 0 ? 75 : 74;
  }
  return chunks.join('\r\n');
}

export function eventSummary(bins) {
  const emojis = bins.map((key) => BIN_TYPES[key].emoji).join('');
  const names = bins.map((key) => BIN_TYPES[key].name).join(' + ');
  return `${emojis} Bin night: ${names}`;
}

export function dayBeforeIso(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function generateIcs(collections, { reminderHour = 18, reminderMinute = 0, now = new Date() } = {}) {
  const stamp = formatUtcStamp(now);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bin Night//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bin Night',
  ];

  for (const { date, bins } of collections) {
    const reminderDate = dayBeforeIso(date);
    const dtStart = formatLocalDateTime(reminderDate, reminderHour, reminderMinute);
    const dtEnd = formatLocalDateTime(reminderDate, reminderHour, reminderMinute + 15);
    const summary = eventSummary(bins);

    lines.push(
      'BEGIN:VEVENT',
      foldLine(`UID:binnight-${date}@bin-night.app`),
      `DTSTAMP:${stamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      foldLine(`SUMMARY:${escapeIcsText(summary)}`),
      foldLine(`DESCRIPTION:${escapeIcsText('Put out for collection tomorrow morning: ' + bins.map(k => BIN_TYPES[k].name).join(', '))}`),
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:PT0M',
      foldLine(`DESCRIPTION:${escapeIcsText(summary)}`),
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
