\# Decisions \& Tradeoffs



1\. I chose React with Vite for the frontend because it supports a responsive, component-based interface with a fast development workflow.

2\. I used Node.js and Express to build a REST API with separate endpoints for creating, listing, updating, and summarizing tickets.

3\. I chose PostgreSQL for persistent storage because it provides relational data integrity, constraints, and reliable querying.

4\. I used parameterized SQL queries to reduce the risk of SQL injection.

5\. I enforced valid ticket statuses and priorities through API validation and database constraints.

6\. I implemented pagination and optional status filtering to keep ticket listings manageable as the dataset grows.

7\. I used Jest and Supertest to test the API, including validation, ticket creation, filtering, status updates, and statistics.

8\. I kept database credentials in environment variables rather than hardcoding them into application code.

9\. I prioritized the requested core workflow over additional features such as authentication and role-based access control, which were outside the stated assignment scope.



