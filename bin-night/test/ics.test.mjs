import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateIcs, dayBeforeIso, eventSummary } from '../src/ics.mjs';

test('dayBeforeIso rolls over month boundaries', () => {
  assert.equal(dayBeforeIso('2026-05-01'), '2026-04-30');
  assert.equal(dayBeforeIso('2026-01-01'), '2025-12-31');
  assert.equal(dayBeforeIso('2026-03-01'), '2026-02-28');
});

test('eventSummary combines emojis and names', () => {
  assert.equal(eventSummary(['RED']), '🗑️ Bin night: General waste');
  assert.equal(eventSummary(['RED', 'YELLOW']), '🗑️♻️ Bin night: General waste + Recycling');
});

test('generateIcs produces valid VCALENDAR envelope', () => {
  const ics = generateIcs(
    [{ date: '2026-04-21', bins: ['RED'] }],
    { reminderHour: 18, reminderMinute: 0, now: new Date('2026-04-20T10:00:00Z') }
  );
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.match(ics, /VERSION:2\.0/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /END:VEVENT/);
});

test('generateIcs places reminder the evening before at the configured hour', () => {
  const ics = generateIcs(
    [{ date: '2026-04-21', bins: ['RED'] }],
    { reminderHour: 19, reminderMinute: 30, now: new Date('2026-04-20T10:00:00Z') }
  );
  assert.match(ics, /DTSTART:20260420T193000/);
  assert.match(ics, /DTEND:20260420T194500/);
});

test('generateIcs emits one event per collection', () => {
  const ics = generateIcs(
    [
      { date: '2026-04-21', bins: ['RED'] },
      { date: '2026-04-28', bins: ['RED', 'YELLOW'] },
      { date: '2026-05-05', bins: ['RED'] },
    ],
    { now: new Date('2026-04-20T10:00:00Z') }
  );
  const count = (ics.match(/BEGIN:VEVENT/g) || []).length;
  assert.equal(count, 3);
});

test('generateIcs includes a DISPLAY VALARM for the reminder', () => {
  const ics = generateIcs(
    [{ date: '2026-04-21', bins: ['RED'] }],
    { now: new Date('2026-04-20T10:00:00Z') }
  );
  assert.match(ics, /BEGIN:VALARM/);
  assert.match(ics, /ACTION:DISPLAY/);
  assert.match(ics, /TRIGGER:PT0M/);
});

test('generateIcs gives each event a stable unique UID', () => {
  const ics = generateIcs(
    [
      { date: '2026-04-21', bins: ['RED'] },
      { date: '2026-04-28', bins: ['RED'] },
    ],
    { now: new Date('2026-04-20T10:00:00Z') }
  );
  assert.match(ics, /UID:binnight-2026-04-21@bin-night\.app/);
  assert.match(ics, /UID:binnight-2026-04-28@bin-night\.app/);
});
