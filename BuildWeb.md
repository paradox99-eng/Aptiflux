# Online Aptitude Mock Test Platform — Master Build Spec (Phase 1: No Database)

> Give this file to an AI coding assistant (or use it yourself) as the build brief for Phase 1. Supabase/DB work is deferred — see Section 9 for what changes when it's added.

---

## 1. Project Overview

A web platform for hostel students to log in, take timed aptitude mock tests, see instant results, and view a leaderboard. **Phase 1 has no backend/database** — everything runs client-side. This means:

- Login is checked against a hardcoded/static list of students (not real accounts yet)
- Test results are saved to `localStorage` (only visible on that student's own browser)
- The leaderboard UI is fully built now, but powered by **mock data** — swapping in real shared data later (Section 9) requires no UI changes, only a data-source swap

**Known Phase 1 limitation (by design, to be fixed in Phase 2):** since there's no shared backend, the leaderboard cannot show real, live scores from all 300 students — only whatever's hardcoded as sample data, or the current student's own scores. This is fine for building/demoing the UI and flow now.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Auth | Static student list (JSON file) checked client-side or via a simple API route — no password hashing infrastructure needed yet, but structure the code so hashing can be added later without a rewrite |
| Data storage | `localStorage` (per-browser) for test attempts and session |
| Leaderboard data | Static mock JSON file, structured exactly like the future DB query result |

---

## 3. Core Features (Phase 1 scope)

1. **Login** — Name, Room No, Stream, Password checked against a static `students.json` list
2. **Dashboard** — topics list + question counts + this student's own past results (from `localStorage`)
3. **Mock Test (Quiz Engine)** — up to 10 randomized questions per topic, countdown timer with auto-submit, free navigation, clear selection state
4. **Result Screen** — instant scoring, full review with explanations, saved to `localStorage`
5. **Leaderboard (UI only)** — reads from a mock JSON dataset (`mockLeaderboard.js`) shaped exactly like the real weekly query will be, so swapping to Supabase later is a one-file change

---

## 4. Data Structures (replaces DB schema for now)

**`data/students.json`** — static login list
```json
[
  { "name": "Aditi Sharma", "room_no": "B-204", "stream": "CSE", "password": "hostel123" }
]
```
*(Plaintext password is acceptable ONLY because this is a temporary local list, not a real credential store. Do not ship this to production as-is.)*

**`data/topics.js`**
```js
export const topics = [
  { slug: "number-system", name: "Number System" },
  { slug: "percentage", name: "Percentage" }
  // ...
];
```

**`data/questionsData.js`** — question bank per topic
```js
export const questions = {
  "number-system": [
    {
      id: "ns1",
      question: "Find the unit digit of 7^45.",
      options: [{ id: "a", text: "1" }, { id: "b", text: "3" }, { id: "c", text: "7" }, { id: "d", text: "9" }],
      correctOption: "c",
      explanation: "The unit digit of powers of 7 cycles every 4: 7,9,3,1. 45 mod 4 = 1, so the unit digit is 7."
    }
  ]
};
```

**`data/mockLeaderboard.js`** — shaped like the future Supabase query result
```js
export const mockLeaderboard = [
  { name: "Aditi Sharma", room_no: "B-204", stream: "CSE", total_score: 42, tests_taken: 5 },
  { name: "Rohan Das", room_no: "A-110", stream: "ECE", total_score: 38, tests_taken: 4 }
  // ...
];
```

**`localStorage` keys (per student, client-side only)**
- `session` → `{ name, room_no, stream }` (set on login, cleared on logout)
- `attempts` → array of `{ topic, score, totalQuestions, answers, submittedAt }`

---

## 5. Auth Flow (Phase 1)

1. Login page collects Name, Room No, Stream, Password
2. Checked against `data/students.json` (exact match on room_no + password; name/stream can be pre-filled or also verified)
3. On success: save `{ name, room_no, stream }` to `localStorage` under `session`
4. Route protection: a client-side check (or Next.js middleware reading a cookie mirror of the session) redirects to `/login` if `session` is missing
5. Logout: clear `localStorage.session`

**Structure this so Phase 2 is a drop-in swap:** put the login-check logic in a single function (e.g. `lib/auth.js`'s `verifyLogin(room_no, password)`) so that later it can be changed to call a real API/DB instead of reading the JSON file, without touching the Login page component.

---

## 6. Routes & Pages (Next.js App Router)

```
app/
├── layout.jsx
├── page.jsx                    -- "/"              Dashboard
├── login/
│   └── page.jsx                -- "/login"
├── test/
│   └── [topic]/
│       └── page.jsx            -- "/test/[topic]"  Quiz engine
├── result/
│   └── page.jsx                -- "/result"
└── leaderboard/
    └── page.jsx                -- "/leaderboard"

data/
├── students.json
├── topics.js
├── questionsData.js
└── mockLeaderboard.js

lib/
├── auth.js                     -- verifyLogin(), session get/set/clear helpers
├── attempts.js                 -- save/read attempts from localStorage
└── scoring.js                  -- scoring logic (kept separate so it's reusable when scoring moves server-side later)
```

---

## 7. Quiz Engine Requirements

- Pull up to 10 randomized questions for the topic from `questionsData.js`
- Countdown timer (default 10 minutes), sticky, auto-submits at `00:00`
- Free navigation via Previous/Next; selections persist across navigation
- On submit: score client-side using `lib/scoring.js`, save the attempt to `localStorage`, navigate to `/result` with the scored data
- *(Phase 2 note: once a backend exists, scoring should move server-side so scores can't be tampered with via browser dev tools — acceptable risk for now since this is a low-stakes hostel practice tool)*

---

## 8. Leaderboard (Phase 1 — UI only)

- `/leaderboard` renders a ranked table/list from `mockLeaderboard.js`, sorted by `total_score` descending
- Build the component to accept a `leaderboardData` prop/array — so when Phase 2 swaps in a real API call, only the data-fetching wrapper changes, not the display component
- Optionally: merge in the current logged-in student's own `localStorage` attempts total so they can at least see "your score" alongside the mock leaderboard, to make the demo feel more real

---

## 9. Phase 2 (Later — Adding Supabase)

When ready to add the real backend, this is the seam to build along:

- Replace `data/students.json` checks in `lib/auth.js` with a call to a `/api/login` route that queries a real `students` table (bcrypt-hashed passwords)
- Replace `localStorage` attempt saving with a `POST /api/submit-test` that writes to an `attempts` table
- Replace `mockLeaderboard.js` with a `GET /api/leaderboard` call running the weekly aggregate query (see the earlier architecture doc for the exact SQL)
- Move scoring server-side in the submit-test API route
- Add Next.js middleware for real session/cookie-based route protection

No page/component structure needs to change — only the data-source functions inside `lib/`.

---

## 10. Design System

**Colors**
- Primary (headers/nav): Deep Blue `#1E3A8A`
- Accent (buttons): Emerald Green `#10B981`
- Backgrounds: App `#F8FAFC`, Cards `#FFFFFF` with `#E2E8F0` borders
- Correct: `#22C55E` text / `#DCFCE7` background
- Incorrect: `#EF4444` text / `#FEE2E2` background

**Typography**
- Primary font: Inter/Roboto; Numbers: monospace (Fira Code/Space Mono)
- H1: 24px bold · H2: 20px semi-bold · Body: 16px, line-height 1.6

**UI details**
- Cards: 8px radius, subtle shadow; Buttons: 6px radius, bold, 12px/24px padding
- Timer <1 min: turns red, gentle pulse
- Result cards stagger in (100ms delay) on reveal

**Accessibility (WCAG 2.1 AA target)**
- 4.5:1 minimum contrast; full keyboard navigation with visible focus outlines
- `aria-live="polite"` timer announcements at 5-min/1-min/30-sec marks
- Labelled radio inputs; `aria-live` submit announcement ("Test submitted. You scored X out of Y.")

---

## 11. Build Order

1. Scaffold Next.js project + Tailwind
2. Build `data/` files: `students.json`, `topics.js`, `questionsData.js`, `mockLeaderboard.js`
3. Build `lib/auth.js`, Login page, basic route protection
4. Build Dashboard — topics list + student's own `localStorage` history
5. Build Quiz engine + `lib/scoring.js`
6. Build Result page
7. Build Leaderboard page against `mockLeaderboard.js`
8. Apply design system + accessibility pass across all pages
9. Deploy to Vercel (static/no-DB deploy is simple at this stage)
10. **Later:** follow Section 9 to wire in Supabase
