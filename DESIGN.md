# UI/UX Design & Technical Standards (DESIGN.md)
**Project:** Online Aptitude Mock Test Platform  
**Purpose:** This document defines the visual design system, motion guidelines, and technical benchmarks (SEO, Performance, Accessibility) required for a production-ready application.

---

## 1. Professional Theme & Design System

### 1.1 Color Palette
To establish trust and focus (crucial for an educational testing platform), the UI will use a modern, clean, and distraction-free palette.
* **Primary Color (Brand/Focus):** Deep Blue (`#1E3A8A` / Tailwind `blue-900`) - Used for headers and primary navigation.
* **Accent Color (Action):** Emerald Green (`#10B981` / Tailwind `emerald-500`) - Used for "Start Test" and "Submit" buttons.
* **Backgrounds:** 
  * App Background: Off-white/Light Slate (`#F8FAFC`) to reduce eye strain.
  * Card Background: Pure White (`#FFFFFF`) with subtle borders (`#E2E8F0`).
* **Feedback Colors (Results):**
  * Correct: Success Green (`#22C55E`) with a light green background (`#DCFCE7`).
  * Incorrect: Error Red (`#EF4444`) with a light red background (`#FEE2E2`).

### 1.2 Typography
* **Primary Font:** *Inter* or *Roboto* (Clean, modern sans-serif). Highly legible for long reading sessions.
* **Math/Numbers Font:** *Fira Code* or *Space Mono* (Monospace for numbers and formulas to ensure perfect vertical alignment).
* **Hierarchy:**
  * H1 (Page Titles): 24px, Bold, Slate 900
  * H2 (Section Headers): 20px, Semi-Bold, Slate 800
  * Body (Questions): 16px, Normal, Slate 700 (Line-height: 1.6 for readability).

### 1.3 UI Elements
* **Cards:** 8px border-radius (`rounded-lg`), subtle drop shadow (`box-shadow: 0 4px 6px rgba(0,0,0,0.05)`).
* **Buttons:** Flat design, 6px border-radius, bold text, ample padding (12px 24px).

---

## 2. Animations & Micro-Interactions
Animations should be purposeful, guiding the user's attention without being distracting during a timed test.

* **Page Transitions:** Gentle fade-in (`opacity 0 -> 1` over 200ms) when navigating between Dashboard, Quiz, and Result screens.
* **Button Hover States:** 
  * Primary buttons lift slightly (`transform: translateY(-2px)`) with a slightly enhanced shadow.
  * Option buttons in the quiz turn solid blue when selected, with a quick 150ms ease-in-out transition.
* **Timer Warning:** When the countdown reaches less than 1 minute, the timer text turns red and softly pulses (`scale(1.05)`) every second to create a sense of urgency.
* **Result Reveal:** On the results page, the summary cards stagger their entrance (fading in one after another with a 100ms delay) for a satisfying reveal.

---

## 3. SEO (Search Engine Optimization)
*Target: Ensure test topic pages rank organically on search engines.*

* **Semantic HTML:** Strict use of `<header>`, `<main>`, `<article>`, and `<section>` tags instead of standard `<div>` wrappers.
* **Dynamic Meta Tags:** Using React Helmet, the `<title>` and `<meta name="description">` will update based on the route.
  * *Example:* "Take a Free Number System Aptitude Mock Test | Improve Your Math Score."
* **URL Structure:** Clean, readable slugs (e.g., `yoursite.com/test/number-system`).
* **Open Graph (OG) Tags:** Added for rich social sharing (Facebook, Twitter, WhatsApp), displaying a preview image of the test topic when a link is shared.
* **Lighthouse SEO Target:** 100/100

---

## 4. Performance Standards
*Target: Sub-second load times on 3G mobile networks.*

* **Code Splitting:** Use React `lazy()` and `Suspense` to split the `Quiz` and `Result` components. The browser only downloads the Quiz code when the user actually clicks "Start Test".
* **Asset Optimization:** No heavy imagery. SVGs used for all icons to keep DOM size minimal.
* **State Management Efficiency:** Avoid unnecessary re-renders during the countdown timer. The timer component will be isolated so it doesn't force the entire question UI to re-render every second.
* **Lighthouse Performance Target:** 95+/100 (First Contentful Paint < 1.2s, Time to Interactive < 1.5s).

---

## 5. Accessibility (A11y)
*Target: WCAG 2.1 AA Compliance. The app must be fully usable by individuals with visual or motor impairments.*

* **Color Contrast:** All text against backgrounds will maintain a minimum contrast ratio of 4.5:1 (e.g., dark slate text on white cards).
* **Keyboard Navigation:** 
  * 100% navigable using `Tab`, `Enter`, and `Space`. 
  * All buttons and clickable option cards will have distinct `:focus-visible` outlines (e.g., a 2px solid blue ring) so keyboard users know exactly where they are.
* **Screen Reader Support (ARIA):**
  * The countdown timer will have an `aria-hidden="true"` element for visual display, but an `aria-live="polite"` element that announces the time at 5-minute, 1-minute, and 30-second marks.
  * Form inputs (radio buttons for options) will have properly associated `<label>` tags.
  * When a test is submitted, an `aria-live` region will announce: *"Test submitted. You scored 8 out of 10."*
* **Lighthouse Accessibility Target:** 100/100