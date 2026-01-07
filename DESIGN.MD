# `DESIGN.md` - Continuous Appraisal & Performance System (CAPS)

## 1. Project Overview
**Name:** CAPS (Continuous Appraisal & Performance System)
**Goal:** A sprint-based/periodic performance tracking system where employees receive granular, rating-based feedback from Project Managers (PMs). This data is visualized as growth trends for the employee and aggregated for HR/Boss final reviews.

## 2. Tech Stack
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS.
*   **UI Library:** **shadcn/ui** (Radix Primitives), Lucide React (Icons), Recharts (for performance graphs).
*   **Backend:** Spring Boot (Java 17+), Spring Security (JWT), Spring Data JPA.
*   **Database:** MySQL.
*   **Architecture:** REST API + Single Page Application (SPA).

## 3. User Roles
1.  **HR:** System admin, initiates appraisal cycles, manages users.
2.  **Employee:** The subject. Views graphs, answers self-reflection, provides clarification on feedback.
3.  **Project Manager (PM):** The evaluator. Provides rating-based answers and optional comments per sprint/cycle.
4.  **Boss/Manager:** The closer. Reviews the aggregated feedback and closes the appraisal.

## 4. Database Schema (Conceptual)

*   `users`: (id, username, password, role, designation)
*   `questions`: (id, text, category, is_active) - *e.g., "Code Quality", "Communication"*
*   `appraisal_cycles`: (id, employee_id, initiated_by_hr_id, start_date, end_date, status)
    *   *Status: OPEN, PENDING_PM_REVIEW, PENDING_BOSS_REVIEW, CLOSED*
*   `self_assessments`: (id, cycle_id, question_id, rating, comment)
*   `pm_reviews`: (id, cycle_id, pm_id, submission_date)
*   `pm_ratings`: (id, review_id, question_id, rating, comment)
*   `clarifications`: (id, pm_rating_id, employee_reply_text, pm_counter_reply)

## 5. UI/UX Architecture (Shadcn + Pages)

### Global Elements
*   **Theme:** Professional Dark/Light mode toggle.
*   **Layout:** Sidebar navigation (App Shell), Top bar with User Profile.

### Screens & Components

#### A. Auth
*   **Login Page:** Clean, centered card.

#### B. HR Dashboard
*   **Initiate Dialog:** `Dialog` component with `Select` (Employee list).
*   **Progress Board:**
    *   Left: `ScrollArea` list of active appraisals.
    *   Right: Details pane using `Card` and `Badge` for status.

#### C. Employee Dashboard (The "Vibe" Center)
*   **Performance Graph:** `Recharts` Line/Radar chart showing rating trends over time (Sprint vs Sprint).
*   **Appraisal List:** `Table` or list of `Card`s.
*   **Action Area:**
    *   `Progress` bar (e.g., "Waiting for 2 PMs").
    *   **Self Input Form:** `Slider` for ratings, `Textarea` for comments.

#### D. Feedback & Clarification
*   **Feedback View:**
    *   List of questions.
    *   Accordion style view for PM feedback.
    *   **Clarification Loop:** Input field nested under specific PM comments to "Reply".

#### E. Project Manager Interface
*   **Pending Reviews:** List of requests.
*   **Rating Form:**
    *   Wizard or Long-scroll form.
    *   Mandatory 1-10 Rating (`Slider` or `RadioGroup`).
    *   Optional Comment (`Input`).

#### F. Boss Finalization
*   **Review Dashboard:** Aggregated view of Self + PM ratings.
*   **Action:** "Close Appraisal" button (`AlertDialog` confirmation).

## 6. Development Phasing Plan

### Phase 1: Foundation & Auth
*   Setup Spring Boot (Web, Security, JPA, MySQL).
*   Setup React + Vite + Shadcn.
*   Database setup (Users, Roles).
*   Login Screen & JWT Authentication logic.
*   Basic App Layout (Sidebar).

### Phase 2: HR & Appraisal Initiation
*   Backend: APIs for creating Appraisal Cycles and fetching Users.
*   Frontend: HR Dashboard.
*   Feature: "Initiate Appraisal" Dialog.

### Phase 3: The Manager Feedback Loop (Core Logic)
*   Backend: APIs for fetching Questions, submitting PM Ratings.
*   Frontend: PM Dashboard & Rating Form.
*   Feature: Storing detailed ratings per question.

### Phase 4: Employee Dashboard & Visualization
*   Backend: Aggregating data for graphs.
*   Frontend: Recharts integration.
*   Feature: Visualizing the ratings.
*   Feature: Employee Self-Assessment inputs.

### Phase 5: Feedback Loop & Boss Closure
*   Backend: APIs for Clarifications (Replies) and Finalizing.
*   Frontend: Feedback view with Reply buttons.
*   Frontend: Boss "Finalize" screen.
*   Final Polish (Animations, Toast notifications).

***
