#  Mini Ticket Tracker

### A simple, full-stack ticket management dashboard built with React, Express, and PostgreSQL.

Manage support tickets from creation to resolution through a clean dashboard. Create tickets, track priorities, update statuses, filter results, and monitor ticket statistics—all backed by a REST API and PostgreSQL database.



---

##  Features

- ** Ticket management** — Create tickets with a title, description, and priority.
- ** Status tracking** — Move tickets between `open`, `in_progress`, and `closed`.
- ** Priority management** — Assign `low`, `medium`, or `high` priority.
- ** Search and filtering** — Find tickets and filter the current listing by status.
- ** Pagination** — Retrieve ticket records in manageable pages.
- ** Dashboard statistics** — View ticket counts grouped by status.
- ** Input validation** — Validate ticket data and return appropriate HTTP errors.
- ** Automated tests** — Test key API workflows with Jest and Supertest.
- ** Responsive interface** — Use the dashboard across desktop and smaller screens.

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Database driver | `pg` |
| API testing | Jest, Supertest |
| Development | npm, Nodemon |

##  Project Structure

```text
mini-ticket-tracker/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── server.test.js
│   ├── package.json
│   └── .env                 # Create locally; never commit
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── DECISIONS.md
├── README.md
└── .gitignore
```

##  Getting Started

Follow these steps to run the application locally.

### Prerequisites

Install the following before you begin:

- [Node.js and npm](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Clone the repository

```bash
git clone https://github.com/sam-Adk/mini-ticket-tracker.git
cd mini-ticket-tracker
```

### 2. Create the database

Open PostgreSQL using `psql` or a database client and create the database:

```sql
CREATE DATABASE mini_ticket_tracker;
```

Connect to `mini_ticket_tracker`, then create the tickets table:

```sql
CREATE TABLE tickets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(200) NOT NULL
        CHECK (length(trim(title)) > 0),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'closed')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Configure and start the backend

Create a file named `.env` inside the `backend` directory:

```env
DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=mini_ticket_tracker
DB_PASSWORD=your_local_postgres_password
DB_PORT=5432
PORT=3000
```

Replace `your_local_postgres_password` with your own PostgreSQL password. Do not commit this file.

Install the backend dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

The API should now be available at:

**http://localhost:3000**

You can check the health endpoint at `http://localhost:3000/`.

### 4. Start the frontend

Keep the backend running. Open a **second terminal** in the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The frontend connects to the API at `http://localhost:3000`.

##  API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check API health |
| `POST` | `/tickets` | Create a ticket |
| `GET` | `/tickets` | List tickets with optional filtering and pagination |
| `PATCH` | `/tickets/:id` | Update a ticket's status or priority |
| `GET` | `/tickets/stats` | Get ticket counts grouped by status |

### Query parameters

The ticket listing endpoint supports:

| Parameter | Description |
|---|---|
| `status` | Optional status filter: `open`, `in_progress`, or `closed` |
| `page` | Page number; defaults to `1` |
| `limit` | Page size; defaults to `10`, with a maximum of `100` |

Example request:

```http
GET /tickets?status=open&page=1&limit=10
```

### Example: Create a ticket

**Request**

```http
POST /tickets
Content-Type: application/json
```

```json
{
  "title": "Investigate login issue",
  "description": "Users report intermittent login failures",
  "priority": "high"
}
```

The API creates the ticket with `open` status by default and returns the created record.

### Example: Update a ticket

```http
PATCH /tickets/1
Content-Type: application/json
```

```json
{
  "status": "in_progress",
  "priority": "high"
}
```

### Example: Ticket statistics

```http
GET /tickets/stats
```

Example response:

```json
{
  "open": 4,
  "in_progress": 2,
  "closed": 7
}
```

The numbers above are illustrative; actual counts depend on the database contents.

##  Running Tests

The backend includes automated API integration tests covering health checks, validation, ticket creation, filtering, pagination, status updates, and statistics.

From the `backend` directory, run:

```bash
npm test
```

The current test suite contains six tests.

##  Security and Data Integrity

- Database queries use parameterized SQL.
- API inputs are validated before processing.
- Database constraints enforce valid statuses, priorities, and non-empty ticket titles.
- Credentials are supplied through environment variables.
- `.env`, dependency folders, and generated files are excluded through Git ignore rules.

##  Technical Decisions

See [`DECISIONS.md`](DECISIONS.md) for the reasoning behind the technology choices, validation strategy, pagination, testing approach, and scope trade-offs.

##  Author

**Samuel Adikah**

- GitHub: [@sam-Adk](https://github.com/sam-Adk)
- LinkedIn: [Samuel Adikah](https://www.linkedin.com/in/samuel-adikah-50a3a132a/)
- Portfolio: [View my portfolio](https://samuel-portfolio-react.onrender.com)

---

<p align="center">
  Built with React, Express, and PostgreSQL.
</p>




