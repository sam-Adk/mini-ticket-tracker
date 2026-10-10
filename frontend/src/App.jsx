
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Clock3,
  Filter,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  Search,
  Ticket,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:3000";

const emptyStats = { open: 0, in_progress: 0, closed: 0 };

const statusLabels = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Something went wrong. Please try again.");
  }

  return result;
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({ page: String(page), limit: "6" });

      if (statusFilter !== "all") {
        query.set("status", statusFilter);
      }

      const [ticketResult, statsResult] = await Promise.all([
        apiRequest(`/tickets?${query.toString()}`),
        apiRequest("/tickets/stats"),
      ]);

      setTickets(ticketResult.data);
      setPagination(ticketResult.pagination);
      setStats(statsResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const visibleTickets = tickets.filter((ticket) => {
    const term = search.trim().toLowerCase();

    return (
      !term ||
      ticket.title.toLowerCase().includes(term) ||
      (ticket.description || "").toLowerCase().includes(term)
    );
  });

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.title.trim()) {
      setError("Please enter a ticket title.");
      return;
    }

    setCreating(true);

    try {
      await apiRequest("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
        }),
      });

      setForm({ title: "", description: "", priority: "medium" });
      setShowForm(false);
      setPage(1);
      setStatusFilter("all");
      setSearch("");
      setNotice("Your ticket has been created successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateTicket(id, changes) {
    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });

      setNotice("Ticket updated successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  function changeFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  const totalTickets = stats.open + stats.in_progress + stats.closed;
  const completionRate = totalTickets
    ? Math.round((stats.closed / totalTickets) * 100)
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="TrackDesk home">
          <span className="brand-mark"><Ticket size={23} /></span>
          <span>Track<span className="brand-light">Desk</span></span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <button className="nav-item active" type="button">
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>
        <button
          className="nav-item"
          type="button"
          onClick={() => {
            changeFilter("all");
            setShowForm(true);
          }}
        >
          <CirclePlus size={18} />
          <span>Create ticket</span>
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-status-dot" />
          <div>
            <strong>API connected</strong>
            <span>Local development</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-right">
            <span className="live-indicator"><span /> Live dashboard</span>
            <div className="avatar">S</div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR WORKSPACE</p>
              <h1>Ticket overview</h1>
              <p className="subtitle">
                Track issues, manage priorities, and keep work moving.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setNotice("");
                setShowForm((current) => !current);
              }}
            >
              {showForm ? <X size={18} /> : <CirclePlus size={18} />}
              {showForm ? "Cancel" : "New ticket"}
            </button>
          </div>

          {error && (
            <div className="message error-message" role="alert">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={17} />
              </button>
            </div>
          )}

          {notice && (
            <div className="message success-message" role="status">
              <Check size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss notice">
                <X size={17} />
              </button>
            </div>
          )}

          {showForm && (
            <section className="form-panel">
              <div className="section-heading">
                <div>
                  <h2>Create a ticket</h2>
                  <p>Describe the issue and choose its priority.</p>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleCreate}>
                <label htmlFor="ticket-title">Ticket title <span>*</span></label>
                <input
                  id="ticket-title"
                  maxLength={200}
                  placeholder="e.g. Unable to access account"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  required
                />

                <label htmlFor="ticket-description">Description</label>
                <textarea
                  id="ticket-description"
                  placeholder="Add more details about this issue..."
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />

                <label htmlFor="ticket-priority">Priority</label>
                <select
                  id="ticket-priority"
                  value={form.priority}
                  onChange={(event) =>
                    setForm({ ...form, priority: event.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" disabled={creating}>
                    {creating && <LoaderCircle className="spin" size={17} />}
                    {creating ? "Creating..." : "Create ticket"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="stats-grid">
            <StatCard
              label="Total tickets"
              value={totalTickets}
              detail="Across all statuses"
              icon={<Ticket size={20} />}
              tone="blue"
            />
            <StatCard
              label="Open"
              value={stats.open}
              detail="Awaiting action"
              icon={<CirclePlus size={20} />}
              tone="amber"
            />
            <StatCard
              label="In progress"
              value={stats.in_progress}
              detail="Currently being worked on"
              icon={<Activity size={20} />}
              tone="violet"
            />
            <StatCard
              label="Closed"
              value={stats.closed}
              detail={`${completionRate}% completion rate`}
              icon={<Check size={20} />}
              tone="green"
            />
          </section>

          <section className="tickets-panel">
            <div className="section-heading ticket-heading">
              <div>
                <h2>All tickets <span className="count-badge">{pagination.total}</span></h2>
                <p>Review and manage your latest issues.</p>
              </div>
              <button
                className="secondary-button refresh-button"
                onClick={loadDashboard}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
                Refresh
              </button>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <Search size={17} />
                <input
                  aria-label="Search current page of tickets"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="filter-box">
                <Filter size={16} />
                <select
                  aria-label="Filter tickets by status"
                  value={statusFilter}
                  onChange={(event) => changeFilter(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="ticket-list">
              {loading ? (
                <div className="empty-state">
                  <LoaderCircle className="spin" size={25} />
                  <p>Loading tickets...</p>
                </div>
              ) : visibleTickets.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Ticket size={25} /></div>
                  <h3>{search ? "No matching tickets" : "No tickets here yet"}</h3>
                  <p>
                    {search
                      ? "Try another search term."
                      : "Create a ticket to get your workspace moving."}
                  </p>
                  {!search && (
                    <button
                      className="primary-button"
                      onClick={() => setShowForm(true)}
                    >
                      <CirclePlus size={17} /> Create ticket
                    </button>
                  )}
                </div>
              ) : (
                visibleTickets.map((ticket) => (
                  <article className="ticket-row" key={ticket.id}>
                    <div className={`ticket-symbol priority-${ticket.priority}`}>
                      <Ticket size={19} />
                    </div>

                    <div className="ticket-main">
                      <div className="ticket-title-line">
                        <h3>{ticket.title}</h3>
                        <span className={`priority-badge ${ticket.priority}`}>
                          {ticket.priority === "high" && <ArrowUp size={12} />}
                          {ticket.priority === "low" && <ArrowDown size={12} />}
                          {ticket.priority === "medium" && <Activity size={12} />}
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="ticket-description">
                        {ticket.description || "No description provided."}
                      </p>
                      <div className="ticket-meta">
                        <span>#{ticket.id}</span>
                        <span className="meta-divider">·</span>
                        <Clock3 size={13} />
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>

                    <div className="ticket-controls">
                      <span className={`status-badge ${ticket.status}`}>
                        <span className="status-dot" />
                        {statusLabels[ticket.status]}
                      </span>

                      <label className="sr-only" htmlFor={`status-${ticket.id}`}>
                        Update status for {ticket.title}
                      </label>
                      <select
                        id={`status-${ticket.id}`}
                        className="status-select"
                        value={ticket.status}
                        disabled={updatingId === ticket.id}
                        onChange={(event) =>
                          updateTicket(ticket.id, { status: event.target.value })
                        }
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="closed">Closed</option>
                      </select>

                      <label className="sr-only" htmlFor={`priority-${ticket.id}`}>
                        Update priority for {ticket.title}
                      </label>
                      <select
                        id={`priority-${ticket.id}`}
                        className="priority-select"
                        value={ticket.priority}
                        disabled={updatingId === ticket.id}
                        onChange={(event) =>
                          updateTicket(ticket.id, { priority: event.target.value })
                        }
                      >
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                      </select>
                    </div>
                  </article>
                ))
              )}
            </div>

            <footer className="pagination">
              <span>
                {pagination.total === 0
                  ? "No tickets to display"
                  : `Page ${pagination.page} of ${Math.max(1, pagination.totalPages)} · ${pagination.total} tickets`}
              </span>
              <div className="pagination-actions">
                <button
                  className="icon-button"
                  aria-label="Previous page"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next page"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          </section>

          <footer className="app-footer">
            <span>TrackDesk · Mini Ticket Tracker</span>
            <span><span className="footer-dot" /> Connected to local API</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}

export default App;
