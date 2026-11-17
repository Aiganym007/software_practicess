import { useEffect, useState } from 'react';
import {
  Clock,
  DoorOpen,
  Ban,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { ROOM, INITIAL_BOOKINGS } from './data';
import {
  checkAvailability,
  timeToMinutes,
  minutesToTime,
  formatTimeLabel,
  formatDurationLabel,
} from './availability';
import type { Booking, Decision, Room } from './types';

/** Returns the current local time as minutes after midnight. */
function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function App() {
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [room, setRoom] = useState<Room>(ROOM);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [decision, setDecision] = useState<Decision>({ kind: 'idle' });

  const handleCheck = () => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const currentTime = getCurrentMinutes();

    const result = checkAvailability(room, start, end, currentTime, bookings);

    if (result.available) {
      setDecision({
        kind: 'available',
        message: `${room.name} is available from ${formatTimeLabel(start)} to ${formatTimeLabel(end)}.`,
      });
    } else {
      setDecision({
        kind: 'unavailable',
        message: `${room.name} is not available for this interval.`,
        reasons: result.reasons,
      });
    }
  };

  const [currentTime, setCurrentTime] = useState<number>(
  () => getCurrentMinutes()
);

useEffect(() => {
  const intervalId = window.setInterval(() => {
    setCurrentTime(getCurrentMinutes());
  }, 60_000);

  return () => window.clearInterval(intervalId);
}, []);

const currentTimeLabel = formatTimeLabel(currentTime);

  const handleReset = () => {
    setDecision({ kind: 'idle' });
  };

  const toggleBlocked = () => {
    setRoom((r) => ({ ...r, blocked: !r.blocked }));
    setDecision({ kind: 'idle' });
  };

  // Current local time, shown for the user's reference (read-only).

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 p-2.5 rounded-xl">
              <CalendarCheck className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Smart Campus Room Availability Checker
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-0.5">
                Check if a campus room is free for your time slot.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Checker card */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-teal-600" />
            Check Availability
          </h2>

          {/* Room info */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
              <DoorOpen className="w-4 h-4 text-slate-400" />
              {room.name}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full">
              {room.building}
            </span>
            {room.blocked ? (
              <span className="inline-flex items-center gap-1.5 text-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-full">
                <Ban className="w-4 h-4" />
                Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
                Active
              </span>
            )}
          </div>

          {/* Blocked toggle (the simple frontend setting required by AC3) */}
          <button
            onClick={toggleBlocked}
            className="mb-5 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
          >
            {room.blocked ? (
              <ToggleRight className="w-6 h-6 text-red-500" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
            <span>{room.blocked ? 'Room blocked (always unavailable)' : 'Room active'}</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Start time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setDecision({ kind: 'idle' });
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
              <p className="text-xs text-slate-400 mt-1">{formatTimeLabel(timeToMinutes(startTime))}</p>
            </div>

            {/* End time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setDecision({ kind: 'idle' });
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
              <p className="text-xs text-slate-400 mt-1">{formatTimeLabel(timeToMinutes(endTime))}</p>
            </div>
          </div>

          {/* Current time + duration info */}
          <div className="mt-4 flex flex-col sm:flex-row sm:gap-6 gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Current time (auto): <span className="font-medium text-slate-700">{currentTimeLabel}</span>
            </span>
            <span>
              Duration:{' '}
              <span className="font-medium text-slate-700">
                {formatDurationLabel(timeToMinutes(startTime), timeToMinutes(endTime))}
              </span>
            </span>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheck}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition active:scale-[0.98]"
            >
              Check Availability
            </button>
            <button
              onClick={handleReset}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition active:scale-[0.98]"
            >
              Reset
            </button>
          </div>

          {/* Decision */}
          {decision.kind !== 'idle' && (
            <div
              className={`mt-5 rounded-xl p-4 border transition ${
                decision.kind === 'available'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {decision.kind === 'available' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      decision.kind === 'available' ? 'text-emerald-800' : 'text-red-800'
                    }`}
                  >
                    {decision.kind === 'available' ? 'Available' : 'Unavailable'}
                  </p>
                  <p
                    className={`text-sm mt-0.5 ${
                      decision.kind === 'available' ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {decision.message}
                  </p>
                  {decision.kind === 'unavailable' && decision.reasons.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {decision.reasons.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm text-red-600 flex items-start gap-1.5"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Existing bookings */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-teal-600" />
            Existing Bookings for {room.name}
          </h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No existing bookings for this room.</p>
          ) : (
            <div className="space-y-2">
              {[...bookings]
                .sort((a, b) => a.start - b.start)
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-100"
                  >
                    <span className="text-sm font-medium text-slate-700">{b.label}</span>
                    <span className="text-sm text-slate-500 font-mono">
                      {minutesToTime(b.start)}–{minutesToTime(b.end)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs text-slate-400 text-center">
          Fictional sample data — for demonstration only.
        </p>
      </footer>
    </div>
  );
}

export default App;
