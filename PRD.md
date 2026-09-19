# Product Requirements Document (PRD)
**Product Name:** Online Aptitude Mock Test Platform  
**Platform:** Web Application (Frontend-Only Initial Release)  
**Tech Stack:** React.js, React Router, CSS/Tailwind  

## 1. Product Objective
To provide a lightweight, fast, and interactive web application where users can practice quantitative aptitude topics through timed mock tests. The application will evaluate their performance instantly, provide detailed step-by-step explanations, and track their historical progress.

## 2. Target Audience
* Students preparing for competitive exams (e.g., GRE, GMAT, Banking, Campus Placements).
* Individuals looking to improve their general math and problem-solving skills.

## 3. Scope & Constraints
* **Phase 1 (Current):** Frontend-only application. No backend or external database is required. Questions are stored locally in a JSON structure, and user progress is saved locally using the browser's `localStorage`.
* **Platform:** Optimized for Desktop and Mobile web browsers.

## 4. Core Features & Requirements

### 4.1. Dashboard (Home Screen)
* **Category Selection:** Users must see a list of available main test categories (e.g., *Quantitative Aptitude, Logical Reasoning*).
* **Dynamic Test Metadata:** Each category should display the total number of questions available.
* **Performance History:** A dedicated section displaying past test results fetched from `localStorage`. It must show the topic name, date taken, and final score.

### 4.2. Quiz Engine (Test Screen)
* **Randomized Generation:** The test must dynamically generate a set of up to 10 questions by randomly pulling from all subtopics within the chosen main category.
* **Countdown Timer:** A sticky timer (e.g., 10 minutes) must start as soon as the test loads. 
* **Auto-Submission:** If the timer reaches `00:00`, the test must automatically submit the user's current answers.
* **Navigation:** Users must be able to navigate freely between questions using "Previous" and "Next" buttons.
* **Selection State:** The UI must clearly indicate which option the user has currently selected.
* **URL Routing:** The test must have a unique, shareable URL (e.g., `/test/number-system`). If a user attempts to navigate to an invalid topic URL, they should be redirected to the Dashboard.

### 4.3. Result & Review Screen
* **Score Calculation:** The system must instantly calculate the final score (Correct Answers vs. Total Questions) upon submission.
* **Data Persistence:** The system must instantly save the new score to `localStorage` so it persists across browser sessions.
* **Detailed Review:** The user must see a breakdown of all questions, displaying:
  * The question text.
  * The user's selected answer (highlighted red if wrong, green if correct).
  * The actual correct answer (if the user was wrong).
  * A detailed text explanation of how to solve the problem.
* **Call to Action:** A button to return to the Dashboard.

## 5. Technical Architecture
### 5.1. File Structure
```text
src/
├── App.jsx               (Router Provider)
├── App.css               (Global Styles)
├── questionsData.js      (Mock Database / JSON)
└── pages/
    ├── Dashboard.jsx     (Route: "/")
    ├── Quiz.jsx          (Route: "/test/:topicName")
    └── Result.jsx        (Route: "/result")
```

### 5.2. Routing & Data Flow

* **Routing Library:** `react-router-dom`
* **State Management:**
  * `useState` and `useEffect` for local component state (timer, selected answers).
  * React Router's `useLocation` or `navigate(state)` to pass final test data from the Quiz page to the Result page.
  * `useParams` to fetch the current topic from the URL.

## 6. Future Roadmap (Phase 2 & Beyond)
* **User Authentication:** Allow users to create accounts (Login/Signup) via Firebase or a custom backend.
* **Cloud Database:** Move questionsData.js to a real database (like MongoDB or PostgreSQL) so admins can add questions without changing code.
* **Global Leaderboards:** Compare scores against other users on the platform.
* **Advanced Analytics:** Show users their weakest topics and average time spent per question.
* **Test Resume:** Allow users to pause a test and resume it later.