
const request = require("supertest");
const { app, server } = require("./server");
const pool = require("./db");

beforeAll(async () => {
  await pool.query("SELECT 1");
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
});

describe("Mini Ticket Tracker API", () => {
  test("GET / returns the API health message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Mini Ticket Tracker API is running");
  });

  test("POST /tickets rejects a missing title", async () => {
    const response = await request(app)
      .post("/tickets")
      .send({ description: "A ticket without a title" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Title is required");
  });

  test("POST /tickets creates a ticket", async () => {
    const uniqueTitle = `API test ${Date.now()}`;

    const response = await request(app)
      .post("/tickets")
      .send({
        title: uniqueTitle,
        description: "Created by an automated integration test",
        priority: "high",
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(uniqueTitle);
    expect(response.body.status).toBe("open");
    expect(response.body.priority).toBe("high");
  });

  test("GET /tickets supports status filtering and pagination", async () => {
    const response = await request(app)
      .get("/tickets?status=open&page=1&limit=5");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.every((ticket) => ticket.status === "open")).toBe(true);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(5);
  });

  test("PATCH /tickets/:id updates a ticket status", async () => {
    const created = await request(app)
      .post("/tickets")
      .send({ title: `Status test ${Date.now()}` });

    expect(created.status).toBe(201);

    const response = await request(app)
      .patch(`/tickets/${created.body.id}`)
      .send({ status: "in_progress" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("in_progress");
  });

  test("GET /tickets/stats returns counts grouped by status", async () => {
    const response = await request(app).get("/tickets/stats");

    expect(response.status).toBe(200);
    expect(typeof response.body.open).toBe("number");
    expect(typeof response.body.in_progress).toBe("number");
    expect(typeof response.body.closed).toBe("number");
  });
});
