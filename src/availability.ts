import type { Room, Booking, AvailabilityResult } from './types';

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number,
  bookings: Booking[]
): AvailabilityResult {
  const reasons: string[] = [];

  if (!room) {
    return { available: false, reasons: ['Please select a room.'] };
  }

  // AC1: valid interval (times must be integer minutes after midnight)
  if (!(Number.isFinite(start) && Number.isFinite(end))) {
    return { available: false, reasons: ['Start and end times are required.'] };
  }
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { available: false, reasons: ['Start and end times must be whole minutes.'] };
  }
  if (start < 0 || end > 1440) {
    return {
      available: false,
      reasons: ['Times must be between 00:00 and 24:00.'],
    };
  }
  if (start >= end) {
    return {
      available: false,
      reasons: ['End time must be later than start time.'],
    };
  }
  if (!(start > currentTime)) {
    return {
      available: false,
      reasons: ['Start time must be after the current time.'],
    };
  }

  // AC2: max 120 minutes
  if (end - start > 120) {
    reasons.push('Booking cannot be longer than 120 minutes.');
  }

  // AC3: blocked room
  if (room.blocked) {
    reasons.push('This room is currently blocked and cannot be booked.');
  }

  // AC4: overlap (touching endpoints allowed)
  const overlapping = bookings.filter(
    (b) =>
      b.roomId === room.id &&
      b.start < end &&
      start < b.end
  );
  if (overlapping.length > 0) {
    const labels = overlapping.map((b) => `${b.label} (${fmt(b.start)}–${fmt(b.end)})`);
    reasons.push(`Overlaps existing booking${overlapping.length > 1 ? 's' : ''}: ${labels.join('; ')}.`);
  }

  return { available: reasons.length === 0, reasons };
}

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function minutesToTime(min: number): string {
  return fmt(min);
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

export function formatTimeLabel(min: number): string {
  if (!Number.isFinite(min)) return '—';

  const normalizedMin = min === 1440 ? 0 : min;
  const h = Math.floor(normalizedMin / 60);
  const m = normalizedMin % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDurationLabel(start: number, end: number): string {
  const duration = end - start;
  if (Number.isNaN(duration)) return '—';
  if (duration <= 0) return 'invalid';
  if (duration > 120) return `${duration} min (exceeds 120 min limit)`;
  return `${duration} min`;
}
