# Smart Campus Room Availability Checker

## 1. Project Overview

Smart Campus Room Availability Checker is a simple web application that allows students to check whether a university room is available for a requested time interval.

The application currently supports one room, Room A101, and uses fictional booking data for availability checking.

The main purpose of the project is to demonstrate reliable time validation, booking conflict detection, automated testing and a responsive user interface.

## 2. Project Scope

The application provides the following functionality:

- Check the availability of Room A101.
- Select a requested start and end time.
- Validate the requested time interval.
- Reject past or invalid time intervals.
- Enforce a maximum booking duration of 120 minutes.
- Detect conflicts with existing bookings.
- Reject requests when the room is blocked.
- Display clear availability and validation feedback.
- Support desktop and mobile screen sizes.

### Out of Scope

The application does not include:

- User registration or authentication.
- Database integration.
- Backend services or external APIs.
- Actual booking creation or confirmation.
- Payment functionality.
- Real personal information.

All booking information is fictional and used only for demonstration and testing.

## 3. Technology Stack

The project uses the following technologies:

- React
- TypeScript
- Vite
- Vitest
- ESLint
- Lucide React

## 4. Project Structure

```text
SmartCampus/
├── .bolt/
├── src/
│   ├── App.tsx
│   ├── availability.ts
│   ├── availability.test.ts
│   ├── data.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── AGENTS.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## 5. Acceptance Criteria

The application follows these acceptance criteria:

- **AC1 – Time Validation:** Requested intervals must use valid integer minutes within the day, and the start time must be in the future.
- **AC2 – Maximum Duration:** The requested interval cannot exceed 120 minutes.
- **AC3 – Blocked Room:** A blocked room must be rejected.
- **AC4 – Booking Conflicts:** Requests overlapping existing bookings must be rejected. Endpoint-touching intervals are allowed.
- **AC5 – Data Preservation:** Availability checks must not modify existing booking data.
- **AC6 – User Interface:** The application must provide clear validation feedback and support desktop and mobile layouts.

## 6. Installation and Setup

Install project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at the local URL provided by Vite.

## 7. Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |
| `npx vitest run` | Run automated tests |

## 8. Testing

The project uses Vitest for automated testing.

Run the test suite:

```bash
npx vitest run
```

The tests cover:

- Valid and invalid time intervals.
- Past, zero-length and reversed intervals.
- Maximum duration restrictions.
- Blocked-room conditions.
- Booking overlap detection.
- Endpoint-touching intervals.
- Preservation of existing booking data.
- Regression scenarios.

## 9. AI-Assisted Development Instructions

The project includes an `AGENTS.md` file containing instructions and restrictions for AI-assisted development.

AI coding agents must:

- Read AGENTS.md before making changes.
- Preserve the existing project scope and acceptance criteria.
- Avoid unnecessary refactoring and additional features.
- Keep fictional booking data unchanged.
- Maintain and execute relevant automated tests.
- Avoid introducing backend services, authentication or databases.
- Provide evidence for proposed changes.
- Require human review before accepting modifications.

## 10. Project Limitations

This is an educational prototype developed for Software Engineering coursework.

It uses fictional data and is not intended for real university room management or production booking operations.

## 11. Conclusion

Smart Campus Room Availability Checker demonstrates the use of software engineering principles in a small web application, including modular code organization, input validation, regression testing, AI-assisted development and reliable verification.