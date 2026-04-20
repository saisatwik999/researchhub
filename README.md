# 🚀 Smart Research Collaboration & Idea Incubator Platform

A full-stack MERN application that enables researchers and students to share research ideas, form teams, manage tasks, receive mentor feedback, and be administered via an admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Vite, TailwindCSS, React Router v6, Context API, Axios |
| Backend | Node.js, Express.js, REST API, JWT Auth, Bcrypt, express-validator |
| Database | MongoDB, Mongoose ODM |

## Features

- **JWT Authentication** — Register, Login, Protected Routes
- **Role-Based Access** — Student, Mentor, Admin
- **Idea Management** — Post, Browse, Search, Filter research ideas
- **Team Collaboration** — Send/Approve/Reject join requests, team formation
- **Task Management** — Kanban board, assign tasks, track progress
- **Mentor Feedback** — Mentors review & comment on projects
- **Admin Dashboard** — Manage users, projects, monitor platform stats
- **Premium UI** — Glassmorphism, animations, dark theme, responsive

## Project Structure

```
full_stack_cls/
├── backend/
│   ├── config/db.js
│   ├── controllers/ (6 files)
│   ├── middleware/auth.js, roleAuth.js
│   ├── models/ (5 files)
│   ├── routes/ (6 files)
│   ├── server.js
│   ├── .env / .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ (15+ components)
│   │   ├── context/ (AuthContext, ProjectContext)
│   │   ├── utils/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env   # Edit MONGO_URI and JWT_SECRET
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/research_platform
JWT_SECRET=your_secret_key_here
```

### 3. Start Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/profile` | Get own profile | Private |
| PUT | `/api/users/profile` | Update profile | Private |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id/role` | Update user role | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats/overview` | Platform stats | Admin |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get all projects | Private |
| POST | `/api/projects` | Create project | Private |
| GET | `/api/projects/my` | Get my projects | Private |
| GET | `/api/projects/joined` | Get joined projects | Private |
| GET | `/api/projects/:id` | Get project details | Private |
| PUT | `/api/projects/:id` | Update project | Creator/Admin |
| DELETE | `/api/projects/:id` | Delete project | Creator/Admin |
| GET | `/api/projects/stats/overview` | Project stats | Admin |

### Collaboration Requests
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/collaborations` | Send join request | Private |
| GET | `/api/collaborations/my` | My sent requests | Private |
| GET | `/api/collaborations/received` | Received requests | Private |
| GET | `/api/collaborations/project/:id` | Project requests | Creator |
| PUT | `/api/collaborations/:id/approve` | Approve request | Creator |
| PUT | `/api/collaborations/:id/reject` | Reject request | Creator |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/tasks` | Create task | Team Member |
| GET | `/api/tasks/my` | My assigned tasks | Private |
| GET | `/api/tasks/project/:id` | Project tasks | Private |
| PUT | `/api/tasks/:id` | Update task | Private |
| DELETE | `/api/tasks/:id` | Delete task | Private |

### Feedback
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/feedback` | Add feedback | Private |
| GET | `/api/feedback/my` | My feedback | Private |
| GET | `/api/feedback/project/:id` | Project feedback | Private |
| DELETE | `/api/feedback/:id` | Delete feedback | Author/Admin |

## User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Create profile, browse ideas, request to join, work on tasks, update progress |
| **Mentor** | View all ideas, review projects, provide feedback/comments |
| **Admin** | Manage all users, manage all projects, monitor platform, change user roles |

## Database Schemas

- **User**: name, email, password (hashed), role, skills[], interests[], bio
- **Project**: title, description, tags[], createdBy, teamMembers[], status, category, maxTeamSize
- **CollaborationRequest**: ideaId, userId, message, status (pending/approved/rejected)
- **Task**: projectId, title, description, assignedTo, status (todo/in-progress/done), deadline, priority
- **Feedback**: projectId, userId, message, type (feedback/update/review)
