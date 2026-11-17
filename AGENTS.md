# AGENTS.md

## 1. Project Purpose

This project is a simple Smart Campus Room Availability Checker.

Students can check whether Room A101 is available for a requested time interval. The project uses fictional booking data. The application only checks availability and does not create or confirm bookings.

## 2. Project Structure

- `src/App.tsx` – user interface and interaction.
- `src/availability.ts` – availability rules and time-related helper functions, including `formatDurationLabel()`.
- `src/availability.test.ts` – automated tests.
- `src/data.ts` – fictional room and booking data.
- `src/types.ts` – shared TypeScript types.
- `src/main.tsx` – application entry point.

## 3. Accepted Rules

- Preserve the existing AC1–AC6 acceptance criteria.
- Reject invalid time intervals and past requests.
- Reject durations longer than 120 minutes.
- Reject blocked rooms.
- Reject overlapping bookings.
- Allow endpoint-touching intervals.
- Do not mutate existing booking data.
- Keep the interface clear and responsive on desktop and mobile.
- Keep booking logic separate from UI presentation where appropriate.
- Keep changes small and focused.
- Preserve existing tests and functionality.

## 4. Development and Testing Commands

- Run automated tests using: `npx vitest run`
- Use the existing production build command from `package.json`.
- Report actual test and build results.
- Never claim that tests passed unless they were actually executed.

## 5. Forbidden Scope Changes

- Do not add login or authentication.
- Do not add a backend or database.
- Do not add external APIs.
- Do not implement booking creation or confirmation.
- Do not replace the fictional booking data with real data.
- Do not introduce unnecessary design patterns.
- Do not add Adapter or Strategy unless a genuine requirement justifies them.
- Do not delete or weaken existing tests.
