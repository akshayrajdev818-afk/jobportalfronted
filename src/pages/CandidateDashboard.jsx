
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_OPTIONS = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];

const STATUS_STYLES = {
  APPLIED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  SHORTLISTED: "bg-violet-50 text-violet-700 ring-violet-600/20",
  INTERVIEW: "bg-amber-50 text-amber-700 ring-amber-600/20",
  SELECTED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function formatStatus(status) {
  if (!status) return "Unknown";

  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(date) {
  if (!date) return "Not available";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }) {
  const styles =
    STATUS_STYLES[status] ||
    "bg-slate-100 text-slate-700 ring-slate-500/20";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatStatus(status)}
    </span>
  );
}

function StatCard({ title, value, description, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${colors[color]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
    </article>
  );
}

function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const navigate = useNavigate();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/applications/my-applications");

      setApplications(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to fetch candidate applications:", err);

      if (err.response?.status === 401) {
        setError("Your session may have expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view these applications.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to load your applications."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const statistics = useMemo(
    () => ({
      total: applications.length,
      shortlisted: applications.filter(
        (item) => item.status === "SHORTLISTED"
      ).length,
      interviews: applications.filter(
        (item) => item.status === "INTERVIEW"
      ).length,
      selected: applications.filter(
        (item) => item.status === "SELECTED"
      ).length,
    }),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch = [
        application.job?.title,
        application.job?.location,
        application.job?.employmentType,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              CANDIDATE WORKSPACE
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track your applications and follow your career progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Browse Jobs
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics */}
        <section
          aria-label="Application statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            title="Total Applications"
            value={statistics.total}
            description="Jobs you have applied for"
            icon="▤"
            color="blue"
          />

          <StatCard
            title="Shortlisted"
            value={statistics.shortlisted}
            description="Applications shortlisted"
            icon="★"
            color="violet"
          />

          <StatCard
            title="Interviews"
            value={statistics.interviews}
            description="Applications at interview stage"
            icon="◷"
            color="rose"
          />

          <StatCard
            title="Selected"
            value={statistics.selected}
            description="Successful applications"
            icon="✓"
            color="emerald"
          />
        </section>

        {/* Applications */}
        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Applications
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Check application dates, job details, and hiring progress.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchApplications}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
            >
              ↻ Refresh
            </button>
          </div>

          {/* Search and filter */}
          <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_230px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by job title or location..."
              aria-label="Search applications"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by application status"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="ALL">All statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="mt-4 text-sm text-slate-500">
                Loading your applications...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load applications
              </h3>

              <p className="mt-2 text-sm text-slate-600">{error}</p>

              <button
                type="button"
                onClick={fetchApplications}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="text-4xl" aria-hidden="true">💼</div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Your career journey starts here
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You haven't applied for any jobs yet. Browse available jobs
                and submit your first application.
              </p>

              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Explore Jobs
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            applications.length > 0 &&
            filteredApplications.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  No matching applications
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another search term or status filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </div>
            )}

          {!loading && !error && filteredApplications.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredApplications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold text-slate-900">
                        {application.job?.title || "Job title unavailable"}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        📍 {application.job?.location || "Location not specified"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge status={application.status} />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        APPLICATION ID
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        #{application.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        APPLIED ON
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(application.applicationDate)}
                      </p>
                    </div>

                    {application.job?.employmentType && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-slate-400">
                          EMPLOYMENT TYPE
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {application.job.employmentType}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs leading-5 text-slate-500">
                      Application status is updated by the recruiter.
                      Refresh to check for the latest update.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          JobConnect Candidate Workspace
        </div>
      </footer>
    </div>
  );
}

export default CandidateDashboard;

