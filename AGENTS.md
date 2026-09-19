# AI Agents Architecture (AGENTS.md)
**Project:** Online Aptitude Mock Test Platform  
**Purpose:** This document outlines the proposed multi-agent system designed to automate content creation, personalize student learning, and analyze performance.

## 1. Overview
To scale the platform without requiring constant manual data entry, the system will utilize specialized AI subagents (powered by LLMs/Gemini API). These agents will work in the background or interact directly with the user to create a dynamic, never-ending pool of aptitude tests.

## 2. Proposed Agent Roster

### 2.1. The Content Generator Agent (Question Factory)
* **Role:** Background Worker / Data Pipeline
* **Trigger:** Runs on a scheduled cron job (e.g., weekly) or when the question bank falls below a certain threshold.
* **Responsibilities:**
  * Generates unique, mathematically accurate aptitude questions for specific topics (Number System, Geometry, etc.).
  * Formats the output with 4 multiple-choice options and a clear step-by-step explanation.
  * Validates the math to ensure the correct answer is actually one of the options.
  * Automatically saves the new questions to the database (or JSON files).

### 2.2. The Adaptive Tutor Agent (Personalized Explainer)
* **Role:** User-Facing Assistant
* **Trigger:** Activated when a user reviews their test results and clicks "I don't understand this explanation."
* **Responsibilities:**
  * Reads the specific question, the user's wrong answer, and the correct answer.
  * Initiates a conversational chat with the user to break down the concept into simpler terms.
  * Provides alternative ways to solve the problem (e.g., formulaic method vs. elimination method).

### 2.3. The Analytics & Strategy Agent (Study Planner)
* **Role:** Background Analyst
* **Trigger:** Runs immediately after a user submits a mock test.
* **Responsibilities:**
  * Analyzes the user's historical `localStorage` or database scores.
  * Identifies weak spots (e.g., "User consistently scores below 50% in Time, Speed & Distance").
  * Generates a personalized "Next Steps" study plan or dynamically creates a custom test heavily weighted with the user's weak topics.

## 3. Technical Implementation Details
* **Framework:** Google Antigravity (AGY) SDK / Gemini API
* **Communication:** Agents will communicate via JSON payloads.
* **Workflow:**
  1. The **Analytics Agent** notices a user has exhausted all "HCF & LCM" questions.
  2. It sends a message to the **Content Generator Agent** requesting 20 new moderate-level questions.
  3. The **Content Generator Agent** creates the questions and updates `questionsData.js`.