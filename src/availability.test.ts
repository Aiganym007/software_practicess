import { describe, it, expect } from 'vitest';
import {
  checkAvailability,
  formatDurationLabel,
  formatTimeLabel,
} from './availability';
import type { Room, Booking, AvailabilityResult } from './types';
import { ROOM as CAMPUS_ROOM, INITIAL_BOOKINGS } from './data';

// ---------------------------------------------------------------------------
// Test helper — adapts test case parameters to the real
// checkAvailability function. This is not an application Adapter pattern.
// The case table uses canBook({ start, end, now, blocked, bookings }).
// This helper bridges the two so tests can use the table's shape while
// exercising the real function the page imports.
// ---------------------------------------------------------------------------

const ROOM_ID = 'test-room';
const ROOM: Omit<Room, 'blocked'> = {
  id: ROOM_ID,
  name: 'Test Room',
  building: 'Main Building',
  capacity: 30,
};

function makeRoom(blocked: boolean): Room {
  return { ...ROOM, blocked };
}

function makeBookings(raw: { start: number; end: number }[]): Booking[] {
  return raw.map((b, i) => ({
    id: `fx-${i}`,
    roomId: ROOM_ID,
    start: b.start,
    end: b.end,
    label: `Fixture ${i + 1}`,
  }));
}

interface CanBookParams {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}

interface RunResult {
  result: AvailabilityResult;
  available: boolean;
  before: string;
  after: string;
}

function runCheck(params: CanBookParams): RunResult {
  const room = makeRoom(params.blocked);
  const bookings = makeBookings(params.bookings);
  const before = JSON.stringify(bookings);
  const result = checkAvailability(
    room,
    params.start,
    params.end,
    params.now,
    bookings,
  );
  const after = JSON.stringify(bookings);
  return { result, available: result.available, before, after };
}

// ── Fixture constants ──────────────────────────────────────────────────────
// Fresh per test via runCheck; never mutated by checkAvailability.
const NOW = 540;                        // 09:00
const FX = [{ start: 600, end: 660 }];  // 10:00–11:00 booking

// ── Shared assertion helpers ───────────────────────────────────────────────

/** Asserts the boolean result AND that the bookings array was not mutated. */
function expectAvailable(r: RunResult, expected: boolean) {
  expect(r.available).toBe(expected);
  expect(r.after).toBe(r.before);
}

/**
 * Asserts a specific reason substring is present in the result — catches
 * the defect where `available` is correct but the reason string is wrong
 * or missing, which a bare boolean check would not detect.
 */
function expectReason(r: RunResult, substr: string) {
  expect(r.result.reasons.some((x) => x.includes(substr))).toBe(true);
}

describe('formatDurationLabel', () => {
  it('formats a valid duration in minutes', () => {
    expect(formatDurationLabel(600, 660)).toBe('60 min');
  });

  it('returns invalid for a non-positive interval', () => {
    expect(formatDurationLabel(720, 720)).toBe('invalid');
  });

  it('returns the existing message for durations over 120 minutes', () => {
    expect(formatDurationLabel(720, 841)).toBe('121 min (exceeds 120 min limit)');
  });

  it('returns an em dash when the duration is unavailable', () => {
    expect(formatDurationLabel(Number.NaN, Number.NaN)).toBe('—');
  });
});
describe('formatTimeLabel', () => {
  it('formats 24:00 as midnight (12:00 AM)', () => {
    expect(formatTimeLabel(1440)).toBe('12:00 AM');
  });
  it('returns a placeholder for NaN values', () => {
    expect(formatTimeLabel(Number.NaN)).toBe('—');
  });
});

// ===========================================================================
//  AC1 — valid interval
// ===========================================================================

describe('AC1: valid interval', () => {
  it('T02: 540–570 → false (starts now)', () => {
    const r = runCheck({ start: 540, end: 570, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'after the current time');
  });

  it('T03: 720–720 → false (zero duration)', () => {
    const r = runCheck({ start: 720, end: 720, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'later than start time');
  });

  it('T04: 750–720 → false (reversed)', () => {
    const r = runCheck({ start: 750, end: 720, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'later than start time');
  });

  it('T05: 1380–1441 → false (end past 24:00)', () => {
    const r = runCheck({ start: 1380, end: 1441, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, '00:00 and 24:00');
  });

  it('T16: 480–540 → false (entirely before now)', () => {
    const r = runCheck({ start: 480, end: 540, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'after the current time');
  });

  // Boundary: start exactly 1 minute after now should pass AC1.
  it('T18: 541–570 → true (AC1 boundary, start one minute after now)', () => {
    const r = runCheck({ start: 541, end: 570, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });

  // Boundary: end exactly at 24:00 (1440) should pass AC1.
  it('T19: 1380–1440 → true (AC1 boundary, end exactly 24:00)', () => {
    const r = runCheck({ start: 1380, end: 1440, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });

  it('T23: 540.5–600 → false (fractional start)', () => {
    const r = runCheck({ start: 540.5, end: 600, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'whole minutes');
  });

  it('T24: 540–600.5 → false (fractional end)', () => {
    const r = runCheck({ start: 540, end: 600.5, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'whole minutes');
  });
});

// ===========================================================================
//  AC2 — max 120 minutes
// ===========================================================================

describe('AC2: max 120 minutes', () => {
  it('T06: 720–840 → true (exactly 120 min)', () => {
    const r = runCheck({ start: 720, end: 840, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });

  it('T07: 720–841 → false (121 min)', () => {
    const r = runCheck({ start: 720, end: 841, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, '120 minutes');
  });

  it('T17: 660–661 → true (minimum 1-minute duration in free slot)', () => {
    const r = runCheck({ start: 660, end: 661, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });
});

// ===========================================================================
//  AC3 — blocked room
// ===========================================================================

describe('AC3: blocked room', () => {
  it('T13: 660–720 blocked → false', () => {
    const r = runCheck({ start: 660, end: 720, now: NOW, blocked: true, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'blocked');
  });
});

// ===========================================================================
//  AC4 — overlap (touching endpoints allowed)
// ===========================================================================

describe('AC4: overlap', () => {
  it('T01: 660–720 → true (touching after)', () => {
    const r = runCheck({ start: 660, end: 720, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });

  it('T08: 570–600 → true (touching before)', () => {
    const r = runCheck({ start: 570, end: 600, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });

  it('T09: 630–690 → false (partial overlap)', () => {
    const r = runCheck({ start: 630, end: 690, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'Overlap');
  });

  it('T10: 570–690 → false (contains booking)', () => {
    const r = runCheck({ start: 570, end: 690, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'Overlap');
  });

  it('T11: 615–645 → false (inside booking)', () => {
    const r = runCheck({ start: 615, end: 645, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'Overlap');
  });

  it('T12: 600–660 → false (identical interval)', () => {
    const r = runCheck({ start: 600, end: 660, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'Overlap');
  });

  it('T14: 630–690 no bookings → true', () => {
    const r = runCheck({ start: 630, end: 690, now: NOW, blocked: false, bookings: [] });
    expectAvailable(r, true);
    expect(r.after).toBe(r.before);
  });
});

// ===========================================================================
//  AC5 — data preservation (no mutation of bookings)
// ===========================================================================

describe('AC5: data preservation', () => {
  it('T15: 660–720 → true, bookings unchanged', () => {
    const r = runCheck({ start: 660, end: 720, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, true);
  });

  it('T20: bookings unchanged even on rejected call (630–690 overlap)', () => {
    const r = runCheck({ start: 630, end: 690, now: NOW, blocked: false, bookings: FX });
    expectAvailable(r, false);
    expect(r.after).toBe(r.before);
  });

  it('T21: bookings unchanged with multiple bookings in fixture', () => {
    const multi = [
      { start: 600, end: 660 },
      { start: 720, end: 780 },
    ];
    const r = runCheck({ start: 660, end: 720, now: NOW, blocked: false, bookings: multi });
    expectAvailable(r, true);
    expect(r.after).toBe(r.before);
  });
});

// ===========================================================================
//  AC6 — non-null room guard
//  No AC6 case was provided in the table. Based on the implementation, AC6
//  is the null-room guard: checkAvailability(null, …) must return false.
// ===========================================================================

describe('AC6: null-room guard (inferred from implementation)', () => {
  it('T22: null room → false, real bookings unchanged', () => {
    const bookings = makeBookings(FX);
    const before = JSON.stringify(bookings);
    const result = checkAvailability(null, 660, 720, NOW, bookings);
    expect(result.available).toBe(false);
    expect(JSON.stringify(bookings)).toBe(before);
  });
});

// ===========================================================================
//  Regression: blocked room away from any booking, and real fixture data
// ===========================================================================

describe('regression: blocked room with no overlap (AC3)', () => {
  it('R01: 800–860 blocked with no overlapping booking → false', () => {
    const r = runCheck({ start: 800, end: 860, now: NOW, blocked: true, bookings: FX });
    expectAvailable(r, false);
    expectReason(r, 'blocked');
  });
});

describe('regression: real fixture data (AC4, AC5)', () => {
  const realBefore = JSON.stringify(INITIAL_BOOKINGS);

  it('R02: touching end of seminar (660–720) and start of seminar (780–840) → true', () => {
    expect(checkAvailability(CAMPUS_ROOM, 660, 720, NOW, INITIAL_BOOKINGS).available).toBe(true);
    expect(checkAvailability(CAMPUS_ROOM, 780, 840, NOW, INITIAL_BOOKINGS).available).toBe(true);
  });

  it('R03: overlap with seminar (730–750) → false', () => {
    const r = checkAvailability(CAMPUS_ROOM, 730, 750, NOW, INITIAL_BOOKINGS);
    expect(r.available).toBe(false);
    expect(r.reasons.some((x) => x.includes('Overlap'))).toBe(true);
  });

  it('R04: checks against real fixtures do not modify INITIAL_BOOKINGS', () => {
    checkAvailability(CAMPUS_ROOM, 660, 720, NOW, INITIAL_BOOKINGS);
    checkAvailability(CAMPUS_ROOM, 730, 750, NOW, INITIAL_BOOKINGS);
    checkAvailability(CAMPUS_ROOM, 480, 540, NOW, INITIAL_BOOKINGS);
    expect(JSON.stringify(INITIAL_BOOKINGS)).toBe(realBefore);
  });
});
