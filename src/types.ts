export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number;
  end: number;
  label: string;
}

export interface AvailabilityResult {
  available: boolean;
  reasons: string[];
}

export type Decision =
  | { kind: 'idle' }
  | { kind: 'available'; message: string }
  | { kind: 'unavailable'; message: string; reasons: string[] };
