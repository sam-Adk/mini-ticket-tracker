
const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Mini Ticket Tracker API is running" });
});

// Create a ticket
app.post("/tickets", async (req, res) => {
  try {
    const { title, description = null, priority = "medium" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ error: "Title must be 200 characters or fewer" });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "Priority must be low, medium, or high" });
    }

    const result = await pool.query(
      `INSERT INTO tickets (title, description, priority)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), description, priority]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
});

// List tickets with optional status filter and pagination
app.get("/tickets", async (req, res) => {
  try {
    const { status } = req.query;
    const page = Number.parseInt(req.query.page ?? "1", 10);
    const limit = Number.parseInt(req.query.limit ?? "10", 10);

    if (!Number.isInteger(page) || page < 1 ||
        !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Page must be at least 1 and limit must be between 1 and 100",
      });
    }

    if (status && !["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status filter" });
    }

    const values = [];
    let where = "";

    if (status) {
      values.push(status);
      where = "WHERE status = $1";
    }

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tickets ${where}`,
      values
    );

    const offset = (page - 1) * limit;
    values.push(limit, offset);

    const result = await pool.query(
      `SELECT * FROM tickets ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    console.error("List tickets error:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// Update a ticket's status and/or priority
app.patch("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    if (!/^\d+$/.test(id) || BigInt(id) < 1n) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    if (status === undefined && priority === undefined) {
      return res.status(400).json({
        error: "Provide status, priority, or both to update",
      });
    }

    if (status !== undefined &&
        !["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if (priority !== undefined &&
        !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ error: "Invalid priority" });
    }

    const result = await pool.query(
      `UPDATE tickets
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority)
       WHERE id = $3
       RETURNING *`,
      [status ?? null, priority ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// Ticket counts grouped by status
app.get("/tickets/stats", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM tickets
       GROUP BY status`
    );

    const stats = {
      open: 0,
      in_progress: 0,
      closed: 0,
    };

    for (const row of result.rows) {
      stats[row.status] = row.count;
    }

    res.json(stats);
  } catch (error) {
    console.error("Ticket stats error:", error);
    res.status(500).json({ error: "Failed to fetch ticket statistics" });
  }
});

const PORT = Number(process.env.PORT || 3000);

let server;

if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Ticket Tracker API running at http://localhost:${PORT}`);
  });
}

module.exports = { app, server };