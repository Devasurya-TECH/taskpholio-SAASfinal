# Taskpholio System Analysis & Architecture Breakdown

Taskpholio is a high-performance, real-time SaaS application designed for team management. It follows a modern "Serverless" architecture, leveraging **React** for the frontend and **Supabase** as a comprehensive Backend-as-a-Service (BaaS).

---

## 1. Tech Stack Identification

### Frontend
- **Framework:** React 18.2 (Vite-powered)
- **Routing:** React Router v6
- **State Management:** React Context API (Auth, Notifications)
- **Data Visualization:** Recharts
- **Icons:** React Icons (Ri library)
- **Styling:** Vanilla CSS (Modular architecture)

### Backend (BaaS)
- **Platform:** Supabase
- **Features Used:** Auth, PostgreSQL, Real-time (Postgres Changes), Storage (implied)

### Hosting / Deployment
- **Deployment:** Vercel (Configured via `vercel.json`)
- **Environment:** Node.js runtime for build process

---

## 2. Project Structure

The project follows a component-based modular structure:

- `src/components/`: Reusable UI elements (Buttons, Modals, Badges).
- `src/context/`: Global state providers for Authentication and Notifications.
- `src/lib/`: Service layer containing Supabase client logic (Profile, Task, Meeting, Notification services).
- `src/pages/`: Page-level components corresponding to application routes.
- `src/styles/`: Centralized CSS files adhering to the Neo-Dark design system.
- `index.html`: Entry point for fonts (DM Sans/Mono) and the React root.

---

## 3. Frontend Analysis

### Styling System
The app uses a strict **CSS Variable-based Design System** defined in `global.css`. It follows a "Neo-Dark Brutalist" aesthetic with:
- High contrast overlays
- Glassmorphism effects (subtle transparencies)
- Compact, information-dense grid layouts

### Navigation Flow
1. **Login/Signup:** Public entry points.
2. **Dashboard:** Central overview showing metrics (Recharts) and recent activities.
3. **Tasks:** Real-time task management board with role-based visibility.
4. **Team/Members:** Organizational directory and leadership overview.
5. **Alerts:** Real-time notification center.

---

## 4. Backend & Database Analysis

Taskpholio utilizes a **Database-Centric Architecture**. Since Supabase is used, there is no separate API server; the frontend communicates directly with the database via the `@supabase/supabase-js` SDK.

### Schema Structure (PostgreSQL)
- **`profiles`:** Extends `auth.users`, stores `full_name`, `role` (CEO, CTO, Member), `team`, and `avatar_url`.
- **`tasks`:** Stores title, description, status, visibility, and foreign keys for `created_by` and `assigned_to`.
- **`meetings`:** Stores executive meeting schedules and links.
- **`notifications`:** Tracks user-specific alerts with a `read` state.

---

## 5. Authentication & Authorization

### Authentication
Implemented via **Supabase Auth** using JWT (JSON Web Tokens). The `AuthContext` manages the session lifecycle and automatically loads the associated `profile` on state change.

### Authorization (RBAC)
- **CEO/CTO:** Full access to create tasks, invite members, and schedule meetings.
- **Member:** Restricted to viewing team tasks and updating their own assigned priorities.
- **RLS (Row Level Security):** Enforced at the database level to ensure data privacy between teams and users.

---

## 6. Data Flow

### Real-time Update Flow (Example)
1. **Action:** A CEO completes a task on the `Tasks` page.
2. **Frontend:** Calls `taskService.updateTask()`.
3. **Database:** Supabase PostgreSQL table `tasks` is updated.
4. **Broadcast:** Supabase Real-time broadcasts the change event.
5. **Sync:** Both the `Dashboard` and `Tasks` pages receive the event via `subscribeToTasks` listeners and re-fetch data instantly without a page reload.

---

## 7. Observations

### Strengths
- **Low Latency:** Real-time subscriptions provide an "instant" feel.
- **Maintainability:** Clear separation of logic (lib) and presentation (pages).
- **Scalability:** Leveraging Supabase allows the backend to scale horizontally without manual infrastructure management.

### Limitations
- **Thin Backend:** Complex business logic must either happen on the client or via Supabase Edge Functions. Currently, most logic is client-side.
- **Security Dependency:** Extremely reliant on correctly configured RLS policies; if RLS is disabled, the frontend assumes security.

---
*Analysis completed by Senior Architect Analysis Sub-agent.*
