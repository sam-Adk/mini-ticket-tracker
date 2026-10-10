\# Mini Ticket Tracker



A full-stack ticket management application built for the Lodwar Services developer assessment. It allows users to create tickets, view and filter tickets, update ticket status and priority, and monitor ticket counts by status.



\## Features



\- Create tickets with a title, description, and priority.

\- List tickets with status filtering and pagination.

\- Update ticket status and priority.

\- View ticket statistics grouped by status.

\- Validate API inputs and return appropriate HTTP status codes.

\- Store tickets in PostgreSQL.

\- Run automated API integration tests.



\## Technology Stack



\- \*\*Frontend:\*\* React, Vite, CSS

\- \*\*Backend:\*\* Node.js, Express

\- \*\*Database:\*\* PostgreSQL

\- \*\*Testing:\*\* Jest, Supertest



\## Prerequisites



\- Node.js and npm

\- PostgreSQL



\## Setup



\### 1. Clone the repository



```bash

git clone YOUR\_REPOSITORY\_URL

cd mini-ticket-tracker

```



\### 2. Configure the database



Create a PostgreSQL database named `mini\_ticket\_tracker`.



Create a `tickets` table with the following SQL:



```sql

CREATE TABLE tickets (

&#x20;   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

&#x20;   title VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),

&#x20;   description TEXT,

&#x20;   status VARCHAR(20) NOT NULL DEFAULT 'open'

&#x20;       CHECK (status IN ('open', 'in\_progress', 'closed')),

&#x20;   priority VARCHAR(10) NOT NULL DEFAULT 'medium'

&#x20;       CHECK (priority IN ('low', 'medium', 'high')),

&#x20;   created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

```



\### 3. Configure the backend



Open the `backend` directory and create a `.env` file using your own local PostgreSQL credentials:



```env

DB\_USER=postgres

DB\_HOST=127.0.0.1

DB\_NAME=mini\_ticket\_tracker

DB\_PASSWORD=your\_local\_postgres\_password

DB\_PORT=5432

PORT=3000

```



Install dependencies and start the API:



```bash

cd backend

npm install

npm run dev

```



The API runs at `http://localhost:3000`.



\### 4. Configure the frontend



In a second terminal:



```bash

cd frontend

npm install

npm run dev

```



Open the local URL displayed by Vite in your browser.



\## API Endpoints



| Method | Endpoint | Description |

|---|---|---|

| GET | `/` | API health check |

| POST | `/tickets` | Create a ticket |

| GET | `/tickets` | List tickets with optional status filtering and pagination |

| PATCH | `/tickets/:id` | Update ticket status or priority |

| GET | `/tickets/stats` | Get counts grouped by status |



\### Example ticket



```json

{

&#x20; "title": "Investigate login issue",

&#x20; "description": "Users report intermittent login failures",

&#x20; "priority": "high"

}

```



Valid statuses: `open`, `in\_progress`, `closed`.



Valid priorities: `low`, `medium`, `high`.



\## Testing



Run the automated backend integration tests:



```bash

cd backend

npm test

```



The tests cover API health, input validation, ticket creation, filtering and pagination, status updates, and status statistics.



\## Security and Configuration



Database credentials are stored in a local environment file and should not be committed to version control. API database queries use parameterized SQL, and the API validates incoming ticket data.



