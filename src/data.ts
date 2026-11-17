import type { Room, Booking } from './types';

// One fictional campus room, per the assignment requirements.
export const ROOM: Room = {
  id: 'a101',
  name: 'Room A101',
  building: 'Main Building',
  capacity: 30,
  blocked: false,
};

// Fictional existing bookings, stored directly in the frontend.
export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', roomId: 'a101', start: 540, end: 600, label: 'Morning Lecture' },
  { id: 'b2', roomId: 'a101', start: 720, end: 780, label: 'Seminar' },
];
