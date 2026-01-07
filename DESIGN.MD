# `DESIGN.md` - Appraxis Performance Management System

## 1. Project Overview
**Name:** Appraxis  
**Goal:** A yearly performance appraisal system where employees receive rating-based feedback from Project Managers (PMs). The system provides visual performance comparisons between manager ratings and employee self-assessments, with a structured approval flow through HR → PM → Boss.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 (Vite), TypeScript, Tailwind CSS |
| **UI Library** | shadcn/ui (Radix Primitives), Lucide React (Icons), Recharts (Charts) |
| **Backend** | Spring Boot 3.x (Java 17+), Spring Security (JWT), Spring Data JPA |
| **Database** | MySQL 8.x |
| **Architecture** | REST API + Single Page Application (SPA) |

---

## 3. User Roles & Permissions

| Role | Key Responsibilities |
|------|---------------------|
| **HR** | Initiates appraisal cycles, assigns PMs to cycles, monitors overall progress |
| **Employee** | Submits self-assessment, views performance visualizations, provides clarifications on PM feedback |
| **Project Manager (PM)** | Provides rating-based evaluations (1-10) with optional comments per question |
| **Boss** | Reviews aggregated feedback (PM ratings + self-assessment), finalizes and closes appraisals |

---

## 4. Database Schema

### Entity Relationship Diagram

```
users ─────────────────┬──────────────────┬─────────────────────────────────┐
  │                    │                  │                                 │
  │ employee_id        │ hr_initiator_id  │ reviewer_id                     │
  ▼                    ▼                  │                                 │
appraisal_cycles ◄─────────────────────────┼─────────────────────────────────┤
  │                                       │                                 │
  │ cycle_id                              │                                 │
  ▼                                       ▼                                 │
self_assessments                     pm_reviews ◄───────────────────────────┘
  │                                       │
  │                                       │ review_id
  │                                       ▼
  │                                  pm_ratings
  │                                       │
  │                                       │ pm_rating_id
  │                                       ▼
  │                                  clarifications
  │                                       
  └──────────────── questions ◄───────────┘
```

### Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| username | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (BCrypt hashed) |
| name | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| role | ENUM | NOT NULL (HR, EMPLOYEE, PROJECT_MANAGER, BOSS) |
| designation | VARCHAR(255) | NULLABLE |

#### `questions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| text | VARCHAR(255) | NOT NULL |
| category | VARCHAR(255) | NOT NULL |
| active | BOOLEAN | DEFAULT true |

**Seeded Questions:**
| Category | Question |
|----------|----------|
| Execution | How consistently does this person translate complex requirements into working code without constant supervision? |
| Problem Solving | How effectively does this person unblock themselves and others when facing technical hurdles? |
| Collaboration | Does this person actively participate in code reviews and provide constructive feedback? |
| Documentation | How well does this person document their code and architectural decisions? |
| Security | Does this person demonstrate a strong understanding of security best practices? |

#### `appraisal_cycles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| employee_id | BIGINT | FK → users.id, NOT NULL |
| hr_initiator_id | BIGINT | FK → users.id, NOT NULL |
| start_date | DATE | NOT NULL |
| year | VARCHAR(4) | NOT NULL |
| status | ENUM | NOT NULL (OPEN, PENDING_PM_REVIEW, PENDING_BOSS_REVIEW, CLOSED) |
| self_assessment_submitted | BOOLEAN | DEFAULT false |

#### `self_assessments`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| appraisal_cycle_id | BIGINT | FK → appraisal_cycles.id, NOT NULL |
| question_id | BIGINT | FK → questions.id, NOT NULL |
| rating | INT | NOT NULL (1-10) |
| comment | TEXT | NULLABLE |

#### `pm_reviews`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| appraisal_cycle_id | BIGINT | FK → appraisal_cycles.id, NOT NULL |
| reviewer_id | BIGINT | FK → users.id (PM), NOT NULL |
| status | ENUM | NOT NULL (PENDING, SUBMITTED) |
| feedback_date | DATETIME | NULLABLE |

#### `pm_ratings`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| pm_review_id | BIGINT | FK → pm_reviews.id, NOT NULL |
| question_id | BIGINT | FK → questions.id, NOT NULL |
| rating | INT | NOT NULL (1-10) |
| comment | TEXT | NULLABLE |

#### `clarifications`
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT |
| pm_rating_id | BIGINT | FK → pm_ratings.id, UNIQUE, NOT NULL |
| employee_reply | TEXT | NOT NULL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

---

## 5. Appraisal Status Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPRAISAL LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐         ┌───────────────────┐         ┌─────────────────────┐         ┌────────┐
     │   OPEN   │ ──────► │ PENDING_PM_REVIEW │ ──────► │ PENDING_BOSS_REVIEW │ ──────► │ CLOSED │
     └──────────┘         └───────────────────┘         └─────────────────────┘         └────────┘
          │                        │                            │                           │
          │                        │                            │                           │
     HR initiates            HR assigns PM               PM submits review           Boss finalizes
     appraisal               to the cycle                                            appraisal
          │                        │                            │                           │
          │                        │                            │                           │
     Employee can            PM can access               Boss can view                 Cycle is
     submit self-            review form                 aggregated data               complete
     assessment                                          and close
```

### Status Descriptions

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **OPEN** | Appraisal initiated, waiting for PM assignment | HR: Assign PM · Employee: Submit self-assessment |
| **PENDING_PM_REVIEW** | PM assigned, waiting for PM to complete review | PM: Submit ratings · Employee: Submit self-assessment (if not done) |
| **PENDING_BOSS_REVIEW** | PM review complete, waiting for boss approval | Boss: Review data & finalize · Employee: View feedback, submit clarifications |
| **CLOSED** | Appraisal complete | All: View historical data only |

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password, returns JWT |

### HR Endpoints (`/api/appraisals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/employees` | Get all employees |
| GET | `/users/pms` | Get all project managers |
| GET | `/appraisals` | Get all appraisal cycles |
| POST | `/appraisals` | Initiate new appraisal cycle |
| POST | `/appraisals/{id}/assign-pm` | Assign PM to appraisal cycle |

### Employee Endpoints (`/api/employee`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employee/active-cycle` | Get current year's appraisal cycle |
| GET | `/employee/cycles` | Get all appraisal cycles for employee |
| GET | `/employee/report/{cycleId}` | Get performance report (PM avg + self ratings) |
| GET | `/employee/feedback/{cycleId}` | Get PM feedback with clarifications |
| POST | `/employee/self-assessment/{cycleId}` | Submit self-assessment ratings |
| POST | `/employee/clarify` | Submit clarification on PM feedback |

### PM Endpoints (`/api/pm`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pm/pending-reviews` | Get pending reviews assigned to PM |
| GET | `/questions` | Get all active questions |
| POST | `/pm/reviews/{reviewId}/submit` | Submit review with ratings |

### Boss Endpoints (`/api/boss`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boss/pending` | Get appraisals in PENDING_BOSS_REVIEW status |
| GET | `/boss/summary/{cycleId}` | Get full summary (reports + clarifications) |
| POST | `/boss/close/{cycleId}` | Finalize and close appraisal |

---

## 7. UI Architecture

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: [Appraxis Logo] ─────────── [User Name] [Role] [Logout]│
├───────────────┬─────────────────────────────────────────────────┤
│   SIDEBAR     │                                                 │
│   ─────────   │              MAIN CONTENT AREA                  │
│   Navigation  │                                                 │
│   • Dashboard │                <Outlet />                       │
│   • Role-     │                                                 │
│     specific  │                                                 │
│     links     │                                                 │
├───────────────┴─────────────────────────────────────────────────┤
│                         (Toaster)                               │
└─────────────────────────────────────────────────────────────────┘
```

### Pages by Role

#### Login Page (`/login`)
- Centered card with username/password form
- JWT token stored in localStorage
- Redirects to Dashboard on success

#### Dashboard (`/`)
- **HR View:** Stats cards (Total, Open, Pending, Closed) + Pending appraisals table
- **Other Roles:** Role indicator with navigation prompt

#### HR Dashboard (`/hr-dashboard`)
- **Initiate Appraisal Card:** Dialog to select employee and year
- **Ongoing Appraisals Table:** Employee, Start Date, Status, Action (Assign PM)
- **Assign PM Dialog:** Select project manager

#### Employee Dashboard (`/employee-dashboard`)
- **Cycle Selector:** Dropdown to switch between appraisal years
- **Appraisal History Table:** All cycles with status badges
- **Tabs:**
  - *Visual Insights:* Radar chart + Bar chart comparing PM avg vs Self ratings
  - *Self Assessment:* Rating sliders (1-10) + comment textarea per question (hidden after submission)
  - *Feedback & Replies:* Accordion showing PM comments with reply capability

#### PM Dashboard (`/pm-dashboard`)
- **Pending Reviews Table:** Employee name, cycle year, status, action button

#### PM Review Form (`/pm/reviews/:reviewId`)
- **Wizard-style Form:** One question at a time
- **Progress Bar:** Shows completion
- **Per Question:** Category badge, question text, rating slider (1-10), optional comment

#### Boss Dashboard (`/boss-dashboard`)
- **Pending Appraisals Table:** Only shows PENDING_BOSS_REVIEW cycles
- **Action:** Navigate to review page

#### Boss Review Page (`/boss/review/:cycleId`)
- **Employee Header:** Name, designation, status
- **Performance Radar Chart:** PM avg vs Self ratings
- **Clarifications Accordion:** PM comments with employee replies highlighted
- **Finalize Button:** AlertDialog confirmation to close appraisal

---

## 8. Security & Validation Rules

### Backend Validations
| Rule | Description |
|------|-------------|
| Duplicate Appraisal Prevention | Cannot create multiple appraisals for same employee/year |
| PM Assignment Check | Can only assign PM when status is OPEN |
| Self-Assessment Ownership | Employee can only submit self-assessment for their own cycle |
| Self-Assessment Once | Cannot resubmit self-assessment after initial submission |
| Boss Finalization Check | Can only close appraisals in PENDING_BOSS_REVIEW status |
| Clarification Once | Cannot submit multiple clarifications for same PM rating |

### JWT Security
- Token-based authentication
- Role-based authorization via Spring Security
- Protected routes in frontend via `ProtectedRoute` component

---

## 9. Test Credentials

| Username | Password | Role | Display Name |
|----------|----------|------|--------------|
| hr_admin | password | HR | HR Administrator |
| john_doe | password | EMPLOYEE | John Doe |
| jane_pm | password | PROJECT_MANAGER | Jane Project Manager |
| big_boss | password | BOSS | Big Boss |

---

## 10. Project Structure

```
Appraxis/
├── backend/
│   └── src/main/java/dev/thalha/appraxis/
│       ├── config/          # SecurityConfig
│       ├── controller/      # REST Controllers
│       ├── dto/             # Data Transfer Objects
│       ├── model/           # JPA Entities
│       ├── repository/      # Spring Data Repositories
│       ├── security/        # JWT Utils, Filters
│       ├── seeder/          # Data Seeders
│       └── service/         # Business Logic
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/      # MainLayout
        │   └── ui/          # shadcn/ui components
        ├── context/         # AuthContext
        ├── hooks/           # Custom hooks (useToast)
        ├── lib/             # Axios config, utils
        └── pages/           # Route pages
```

---

## 11. Running the Application

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Server runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`

---

## 12. Future Enhancements (Not Implemented)
- Multi-PM reviews per cycle
- Sprint-based periodic reviews
- Email notifications
- PDF report generation
- Dark/Light mode toggle
- Admin panel for question management