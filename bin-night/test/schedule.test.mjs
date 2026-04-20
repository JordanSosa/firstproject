import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CADENCE,
  binsScheduledFor,
  nextCollectionOnOrAfter,
  upcomingCollections,
} from '../src/schedule.mjs';

const TUESDAY = 2;

function mkConfig(rules) {
  return { collectionDayValue: TUESDAY, reminderHour: 18, reminderMinute: 0, rules, onboarded: true };
}

test('returns null when no rules configured', () => {
  const config = mkConfig([]);
  assert.equal(nextCollectionOnOrAfter(config, '2026-04-20'), null);
});

test('weekly bin is always out on collection day', () => {
  const config = mkConfig([{ type: 'RED', cadence: CADENCE.WEEKLY, referenceIsoDate: null }]);
  const next = nextCollectionOnOrAfter(config, '2026-04-20'); // Monday
  assert.deepEqual(next, { date: '2026-04-21', bins: ['RED'] });
});

test('queried on collection day returns same day', () => {
  const config = mkConfig([{ type: 'RED', cadence: CADENCE.WEEKLY, referenceIsoDate: null }]);
  const next = nextCollectionOnOrAfter(config, '2026-04-21');
  assert.equal(next.date, '2026-04-21');
});

test('fortnightly bin out on reference week', () => {
  const config = mkConfig([
    { type: 'GREEN', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: '2026-04-21' },
  ]);
  assert.deepEqual(binsScheduledFor(config, '2026-04-21'), ['GREEN']);
  assert.deepEqual(binsScheduledFor(config, '2026-04-28'), []);
  assert.deepEqual(binsScheduledFor(config, '2026-05-05'), ['GREEN']);
});

test('fortnightly off-week skips to the following week', () => {
  const config = mkConfig([
    { type: 'GREEN', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: '2026-04-21' },
  ]);
  const next = nextCollectionOnOrAfter(config, '2026-04-28');
  assert.deepEqual(next, { date: '2026-05-05', bins: ['GREEN'] });
});

test('mixed weekly and fortnightly bins', () => {
  const config = mkConfig([
    { type: 'RED', cadence: CADENCE.WEEKLY, referenceIsoDate: null },
    { type: 'YELLOW', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: '2026-04-21' },
    { type: 'GREEN', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: '2026-04-28' },
  ]);
  assert.deepEqual(new Set(binsScheduledFor(config, '2026-04-21')), new Set(['RED', 'YELLOW']));
  assert.deepEqual(new Set(binsScheduledFor(config, '2026-04-28')), new Set(['RED', 'GREEN']));
});

test('non-collection day returns no bins', () => {
  const config = mkConfig([{ type: 'RED', cadence: CADENCE.WEEKLY, referenceIsoDate: null }]);
  assert.deepEqual(binsScheduledFor(config, '2026-04-22'), []); // Wednesday
});

test('fortnightly without reference date is never out', () => {
  const config = mkConfig([{ type: 'GREEN', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: null }]);
  assert.deepEqual(binsScheduledFor(config, '2026-04-21'), []);
});

test('fortnightly rotation works for dates before reference date', () => {
  const config = mkConfig([
    { type: 'GREEN', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: '2026-04-21' },
  ]);
  assert.deepEqual(binsScheduledFor(config, '2026-04-07'), ['GREEN']);
  assert.deepEqual(binsScheduledFor(config, '2026-04-14'), []);
});

test('upcomingCollections returns correct count', () => {
  const config = mkConfig([
    { type: 'RED', cadence: CADENCE.WEEKLY, referenceIsoDate: null },
    { type: 'YELLOW', cadence: CADENCE.FORTNIGHTLY, referenceIsoDate: '2026-04-21' },
  ]);
  const upcoming = upcomingCollections(config, '2026-04-20', 4);
  assert.equal(upcoming.length, 4);
  assert.equal(upcoming[0].date, '2026-04-21');
  assert.deepEqual(new Set(upcoming[0].bins), new Set(['RED', 'YELLOW']));
  assert.equal(upcoming[1].date, '2026-04-28');
  assert.deepEqual(upcoming[1].bins, ['RED']);
});
