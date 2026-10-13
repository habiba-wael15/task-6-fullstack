# Saiket Systems Internship - Task 6: Full Stack User Management System

A production-grade Full Stack User Management System developed for **Saiket Systems Internship Task 6**. Built with a **React** (Vite) frontend, a modular **Node.js / Express.js** REST API backend, and **Microsoft SQL Server** persistence utilizing Windows Authentication (`msnodesqlv8` & ODBC Driver 17).

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Project Structure](#architecture--project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup (SQL Server & SSMS)](#database-setup-sql-server--ssms)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running Automated Tests](#running-automated-tests)
- [REST API Documentation](#rest-api-documentation)
- [Postman Collection](#postman-collection)
- [Screenshots Guide](#screenshots-guide)
- [Troubleshooting](#troubleshooting)
- [GitHub Submission Checklist](#github-submission-checklist)

---

## 🎯 Project Overview

This application delivers a complete, secure User Management dashboard allowing administrators to **Create, Read, Update, and Delete (CRUD)** user profiles with real-time Microsoft SQL Server persistence. All displayed user data originates from the database backend via REST API endpoints with no mock/hardcoded user data or temporary local storage replacements.

---

## ✨ Key Features

### 🖥️ Frontend (React + Vite)
- **Modern Dashboard UI**: Clean white/light aesthetic with an indigo/purple palette, consistent typography, and responsive spacing.
- **Summary Metrics Cards**: Live statistics showing Total Users, Average Age, Age Distribution, and Database Health status.
- **Dynamic Search & Filtering**: Real-time search across user names and email addresses with debounced queries.
- **Interactive Data Table**: User profiles with ID badges, generated avatar initials, email, age, formatted creation dates, and action toolbars.
- **Modal Workflows**:
  - **Add User Modal**: Input validation with real-time error hints.
  - **Edit User Modal**: Pre-filled form with instant change persistence.
  - **User Profile View Modal**: Detailed modal showing complete metadata (Creation and Update timestamps).
  - **Delete Confirmation Modal**: Explicit safety check warning before removing a database record.
- **Notification System**: Floating toast alerts for success, error, and system status updates.
- **Empty & Loading States**: Skeletons, spinners, and friendly empty states when no records match.
- **Responsive & Accessible**: Fully functional on mobile, tablet, and desktop viewports with keyboard navigation (ESC modal dismiss) and accessible form labels.

### ⚙️ Backend (Node.js & Express.js)
- **Layered Architecture**: Clean separation between routes, controllers, business services, data repositories, and validators.
- **Parameterized SQL**: Complete immunity to SQL Injection by executing parameterized queries (`@Name`, `@Email`, `@Age`).
- **Input Validation**: Strict RFC-compliant email verification, non-empty name sanitization, integer age constraints (1–120), and positive integer ID validation.
- **Centralized Error Handling**: Unified error response contracts with domain-specific status codes (400 Bad Request, 404 Not Found, 409 Conflict, 500/503 Service Unavailable).
- **Graceful Shutdown**: Handles process termination signals (`SIGINT`, `SIGTERM`) by draining connection pools.

### 🗄️ Database (Microsoft SQL Server)
- **Dedicated Database**: `SaiketTask6DB` with table `dbo.Users`.
- **Integrity Constraints**: Unique email constraint, positive age check constraint (`1 <= Age <= 120`), and automatic UTC timestamps (`CreatedAt`, `UpdatedAt`).
- **Windows Authentication**: Seamless local connection via Windows SSPI Trusted Connection (`msnodesqlv8` and ODBC Driver 17).
- **Idempotent Migration Script**: Safe schema creation script that checks object existence before creation and seeds initial sample records only when empty.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES Modules), CSS3 (Flexbox/Grid, CSS Variables) |
| **Backend** | Node.js (v20+ / v22+), Express.js 4/5, CORS, Dotenv |
| **Database** | Microsoft SQL Server, `mssql`, `msnodesqlv8`, ODBC Driver 17 for SQL Server |
| **Testing** | Node Native Test Runner (`node --test`), Supertest, Mock Repositories |
| **API Testing**| Postman Collection v2.1 |

---

## 📂 Architecture & Project Structure

```
task-6-fullstack/
├── client/                               # React + Vite Frontend
│   ├── src/
│   │   ├── components/                   # UI components (Header, Sidebar, Modals, Table, etc.)
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Icons.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatsCards.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── UserDetailsModal.jsx
│   │   │   ├── UserModal.jsx
│   │   │   └── UsersTable.jsx
│   │   ├── services/
│   │   │   └── api.js                    # API client with configurable base URL
│   │   ├── App.jsx                       # Main application state container
│   │   ├── index.css                     # Global dashboard styling & design system
│   │   └── main.jsx                      # Vite React entry point
│   ├── .env.example                      # Client environment template
│   ├── index.html                        # HTML5 template
│   ├── package.json                      # Frontend dependencies & scripts
│   └── vite.config.js                    # Vite configuration & dev proxy
│
├── server/                               # Node.js + Express REST API Backend
│   ├── database/
│   │   └── schema.sql                    # SQL Server idempotent initialization script
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js               # MSSQL connection pool & health checks
│   │   │   └── env.js                    # Typed environment variables
│   │   ├── controllers/
│   │   │   └── users.controller.js       # HTTP request handlers
│   │   ├── middleware/
│   │   │   ├── errorHandler.js           # Centralized JSON error response handler
│   │   │   └── notFound.js               # 404 handler for unmatched routes
│   │   ├── repositories/
│   │   │   └── users.repository.js       # Parameterized SQL Server data access layer
│   │   ├── routes/
│   │   │   └── users.routes.js           # Users REST API routes
│   │   ├── services/
│   │   │   └── users.service.js          # Business logic & uniqueness validation
│   │   ├── validators/
│   │   │   └── users.validator.js        # Input sanitization and format validation
│   │   ├── app.js                        # Express app factory with dependency injection
│   │   └── server.js                     # Server bootstrap entry point
│   ├── tests/
│   │   ├── api/                          # HTTP REST API integration tests (Supertest)
│   │   │   ├── health.api.test.js
│   │   │   └── users.api.test.js
│   │   ├── helpers/
│   │   │   └── mockUsersRepository.js    # In-memory repository for isolated tests
│   │   ├── integration/                  # Real SQL Server database tests
│   │   │   └── database.integration.test.js
│   │   └── unit/                         # Isolated unit tests
│   │       ├── users.service.test.js
│   │       └── users.validator.test.js
│   ├── .env.example                      # Server environment template
│   └── package.json                      # Backend dependencies & test scripts
│
├── database/
│   └── schema.sql                        # Root copy of database schema script
├── postman/
│   └── User_Management_API.postman_collection.json # Validated Postman Collection v2.1
├── .gitignore                            # Git ignore configuration
├── package.json                          # Monorepo root convenience scripts
└── README.md                             # Comprehensive documentation
```

---

## 📋 Prerequisites

Before running the application, ensure the following software is installed on your workstation:

1. **Node.js**: Version 18.x, 20.x, or 22.x (`node -v`)
2. **npm**: Version 9.x or 10.x (`npm -v`)
3. **Microsoft SQL Server**: Installed local instance (e.g., `DESKTOP-F3PIBN9` or `localhost`).
4. **SQL Server Management Studio (SSMS)**: Recommended for database inspection.
5. **ODBC Driver for SQL Server**: `ODBC Driver 17 for SQL Server` (standard on Windows 10/11).

---

## 🗄️ Database Setup (SQL Server & SSMS)

The application uses a dedicated database named **`SaiketTask6DB`**.

### Executing via SSMS (Recommended GUI Method)
1. Open **SQL Server Management Studio (SSMS)**.
2. Connect to your local SQL Server instance using **Windows Authentication**.
3. Open `database/schema.sql` (or `server/database/schema.sql`).
4. Click **Execute** (`F5`).
5. Verify in the Object Explorer that `SaiketTask6DB` has been created with table `dbo.Users` containing 4 sample users.

### Executing via Command Prompt / PowerShell (CLI Method)
```powershell
sqlcmd -E -S DESKTOP-F3PIBN9 -i database\schema.sql
```
*(Replace `DESKTOP-F3PIBN9` with your SQL Server instance name or `.` / `localhost`).*

### Schema Details
- **`Id`**: `INT IDENTITY(1,1) PRIMARY KEY`
- **`Name`**: `NVARCHAR(100) NOT NULL` (Length >= 2)
- **`Email`**: `NVARCHAR(255) NOT NULL UNIQUE`
- **`Age`**: `INT NOT NULL` (Checked: `Age >= 1 AND Age <= 120`)
- **`CreatedAt`**: `DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME()`
- **`UpdatedAt`**: `DATETIME2(7) NULL`

---

## ⚙️ Environment Configuration

### Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```ini
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Authentication Mode: 'windows' or 'sql'
DB_AUTH_TYPE=windows
DB_SERVER=DESKTOP-F3PIBN9
DB_NAME=SaiketTask6DB
DB_PORT=1433
DB_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# For SQL Server Authentication (if DB_AUTH_TYPE=sql):
DB_USER=your_username
DB_PASSWORD=your_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Connection Pool Settings
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_POOL_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=15000
```

### Frontend Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```ini
VITE_API_BASE_URL=http://localhost:3000/api
```

> **Security Note:** `.env` files are included in `.gitignore` and must **never** be committed to version control.

---

## 📦 Installation

Install dependencies for both client and server from the root directory:

```bash
# Install all dependencies across client and server
npm run install:all
```

Or install them individually:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

---

## 🚀 Running the Application

### Option A: Run Both Simultaneously (Separate Terminals)

**Terminal 1 - Start the Backend API (Port 3000):**
```bash
# From task-6-fullstack root:
npm run server:dev

# Or inside server/:
cd server
npm run dev
```

**Terminal 2 - Start the React Frontend (Port 5173):**
```bash
# From task-6-fullstack root:
npm run client

# Or inside client/:
cd client
npm run dev
```

Once running, navigate to:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **API Health Endpoint**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 🧪 Running Automated Tests

The backend includes comprehensive test suites covering unit logic, REST API contracts, and real database integration.

### Run All Unit & API Tests (Isolated - No SQL Server Required)
```bash
npm test
```
*or from `server/`:*
```bash
npm run test
```

### Run Specific Test Suites
```bash
# Run Validator and Service unit tests
npm run test:unit

# Run Supertest HTTP API tests
npm run test:api

# Run real SQL Server database integration tests (against SaiketTask6DB)
npm run test:integration
```

---

## 📡 REST API Documentation

### Base URL: `http://localhost:3000`

### 1. Root Information
- **`GET /`**
  - **Response (200 OK)**: API metadata and endpoint index.

### 2. Health Check
- **`GET /api/health`**
  - **Response (200 OK / 503 Degraded)**: Server uptime and database connectivity state.
  ```json
  {
    "success": true,
    "status": "healthy",
    "service": "saiket-task6-user-management-api",
    "uptimeSeconds": 142,
    "timestamp": "2026-10-13T19:00:00.000Z",
    "database": {
      "status": "connected",
      "server": "DESKTOP-F3PIBN9",
      "database": "SaiketTask6DB",
      "authType": "windows",
      "message": "Database connection is healthy and responsive."
    }
  }
  ```

### 3. List & Search Users
- **`GET /api/users`**
  - Query parameters: `?search=<term>` (matches name or email)
  - **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "Id": 1,
        "Name": "Habiba Wael",
        "Email": "habiba.wael@example.com",
        "Age": 22,
        "CreatedAt": "2026-10-13T16:00:00.000Z",
        "UpdatedAt": null
      }
    ]
  }
  ```

### 4. Summary Statistics
- **`GET /api/users/stats`**
  - **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 4,
      "averageAge": 31.5,
      "minAge": 22,
      "maxAge": 45
    }
  }
  ```

### 5. Get User by ID
- **`GET /api/users/:id`**
  - **Response (200 OK)**: Returns the matching user record.
  - **Response (404 Not Found)**: User does not exist.
  - **Response (400 Bad Request)**: Malformed or non-numeric ID.

### 6. Create User
- **`POST /api/users`**
  - **Headers**: `Content-Type: application/json`
  - **Request Body**:
  ```json
  {
    "name": "David Clark",
    "email": "david.clark@example.com",
    "age": 35
  }
  ```
  - **Response (201 Created)**: Returns created record.
  - **Response (400 Bad Request)**: Validation error (missing fields, invalid email, age outside 1–120).
  - **Response (409 Conflict)**: Email is already registered.

### 7. Update User
- **`PUT /api/users/:id`**
  - **Headers**: `Content-Type: application/json`
  - **Request Body**:
  ```json
  {
    "name": "David Clark Updated",
    "email": "david.updated@example.com",
    "age": 36
  }
  ```
  - **Response (200 OK)**: Returns updated record with new `UpdatedAt` timestamp.
  - **Response (404 Not Found)**: User does not exist.
  - **Response (409 Conflict)**: Email already in use by another user.

### 8. Delete User
- **`DELETE /api/users/:id`**
  - **Response (200 OK)**: Confirms deletion.
  - **Response (404 Not Found)**: User does not exist.

---

## 📬 Postman Collection

A complete Postman Collection v2.1 is provided in:
`postman/User_Management_API.postman_collection.json`

### Importing into Postman
1. Launch Postman.
2. Click **Import** in the upper left corner.
3. Drag and drop `User_Management_API.postman_collection.json`.
4. The collection will import with the pre-configured variable `baseUrl = http://localhost:3000`.
5. Execute requests across the **System & Health**, **Users Management**, and **Validation & Error Handling** folders.

---

## 📷 Screenshots Guide

When preparing your submission report or repository presentation, capture and add screenshots to a `screenshots/` directory:

1. **Dashboard Overview**: `screenshots/01-dashboard-overview.png`
   - Capture the main table with populated user profiles and summary statistic cards.
2. **Add User Form**: `screenshots/02-add-user-modal.png`
   - Show the Add User modal with form inputs.
3. **Form Validation Error**: `screenshots/03-validation-errors.png`
   - Show friendly error messages when submitting invalid email or age.
4. **Edit User Form**: `screenshots/04-edit-user.png`
   - Show the Edit modal populated with existing user data.
5. **Delete Confirmation Dialog**: `screenshots/05-delete-confirmation.png`
   - Show the explicit safety confirmation modal.
6. **User Profile View**: `screenshots/06-user-details.png`
   - Show the full profile details card with creation timestamps.
7. **SSMS Database Verification**: `screenshots/07-ssms-database.png`
   - Show the `dbo.Users` table and executed queries in SQL Server Management Studio.
8. **Automated Test Results**: `screenshots/08-test-results.png`
   - Terminal output showing all backend test suites passing.

---

## 🔍 Troubleshooting

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| `ELOGIN` / `Login failed for user` | SQL Server authentication mismatch | Verify `DB_AUTH_TYPE=windows` in `server/.env` and ensure your Windows account has sysadmin/dbcreator privileges on the local SQL Server instance. |
| `Cannot find module 'msnodesqlv8'` | Native module not compiled or missing | Run `npm install` inside `server/`. Ensure Node.js architecture matches installed ODBC driver (64-bit). |
| `[Database Warning] Unable to connect...` | SQL Server service not running | Open Windows Services (`services.msc`), locate `SQL Server (MSSQLSERVER)` or `SQL Server (SQLEXPRESS)`, and start the service. |
| `SaiketTask6DB does not exist` | Database schema not initialized | Run `database/schema.sql` in SSMS or execute `sqlcmd -E -S DESKTOP-F3PIBN9 -i database\schema.sql`. |
| `CORS Error in Browser` | Frontend port mismatch | Ensure `CORS_ORIGIN=http://localhost:5173` is set in `server/.env`. |
| Port 3000 already in use | Another process running on port 3000 | Terminate the process or adjust `PORT=5000` in `server/.env` and update `client/.env`. |

---

## 📋 GitHub Submission Checklist

Before publishing to GitHub:

- [x] Dedicated project folder `task-6-fullstack` preserved.
- [x] Task 1, 2, 3, 4, and 5 untouched and preserved.
- [x] Dedicated SQL Server database `SaiketTask6DB` configured.
- [x] No sensitive files or credentials committed (`.env` in `.gitignore`).
- [x] `.env.example` templates created for both client and server.
- [x] Automated unit and API tests executed and verified passing.
- [x] Real SQL Server database integration verified.
- [x] Frontend builds cleanly with zero errors (`npm run build`).
- [x] Postman collection validated as valid JSON v2.1.
- [x] Comprehensive documentation provided with clear execution commands.

