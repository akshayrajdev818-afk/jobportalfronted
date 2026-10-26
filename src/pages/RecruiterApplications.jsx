import { useCallback, useEffect, useMemo, useState } from "react";
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

function formatDate(date) {
    if (!date) return "Not available";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatStatus(status) {
    if (!status) return "Unknown";

    return status.charAt(0) + status.slice(1).toLowerCase();
}

function StatusBadge({ status }) {
    const style =
        STATUS_STYLES[status] ||
        "bg-slate-100 text-slate-700 ring-slate-500/20";

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
        >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
            {formatStatus(status)}
        </span>
    );
}

function StatCard({ title, value, description, icon, color }) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-700",
        violet: "bg-violet-50 text-violet-700",
        emerald: "bg-emerald-50 text-emerald-700",
        rose: "bg-rose-50 text-rose-700",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </h2>

                    <p className="mt-2 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${colorStyles[color]}`}
                    aria-hidden="true"
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function RecruiterApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [updatingId, setUpdatingId] = useState(null);
    const [notice, setNotice] = useState(null);

   const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const response = await api.get("/applications/recruiter");

        const data = Array.isArray(response.data)
            ? response.data
            : [];

        const formattedApplications = data.map((application) => ({
            applicationId: application.id,
            candidateName: application.candidate?.name || "Unknown candidate",
            candidateEmail: application.candidate?.email || "",
            jobTitle: application.job?.title || "Job title unavailable",
            applicationDate: application.applicationDate,
            status: application.status,
        }));

        setApplications(formattedApplications);
    } catch (err) {
        console.error("Failed to fetch recruiter applications:", err);

        if (err.response?.status === 401) {
            setError("Your session may have expired. Please log in again.");
        } else if (err.response?.status === 403) {
            setError("You do not have permission to view these applications.");
        } else {
            setError(
                err.response?.data?.message ||
                "Unable to load applications. Please try again."
            );
        }
    } finally {
        setLoading(false);
    }
}, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        if (!notice) return;

        const timer = setTimeout(() => {
            setNotice(null);
        }, 3500);

        return () => clearTimeout(timer);
    }, [notice]);

    const statistics = useMemo(() => {
        return {
            total: applications.length,
            shortlisted: applications.filter(
                (item) => item.status === "SHORTLISTED"
            ).length,
            selected: applications.filter(
                (item) => item.status === "SELECTED"
            ).length,
            rejected: applications.filter(
                (item) => item.status === "REJECTED"
            ).length,
        };
    }, [applications]);

    const filteredApplications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return applications.filter((application) => {
            const matchesSearch = [
                application.candidateName,
                application.candidateEmail,
                application.jobTitle,
            ].some((value) =>
                String(value || "").toLowerCase().includes(query)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                application.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [applications, search, statusFilter]);

    const updateStatus = async (applicationId, newStatus) => {
        const currentApplication = applications.find(
            (item) => item.applicationId === applicationId
        );

        if (!currentApplication || currentApplication.status === newStatus) {
            return;
        }

        setUpdatingId(applicationId);
        setNotice(null);

        try {
            await api.put(
                `/applications/${applicationId}/status`,
                null,
                {
                    params: { status: newStatus },
                }
            );

            setApplications((previous) =>
                previous.map((application) =>
                    application.applicationId === applicationId
                        ? { ...application, status: newStatus }
                        : application
                )
            );

            setNotice({
                type: "success",
                message: "Application status updated successfully.",
            });
        } catch (err) {
            console.error("Failed to update application status:", err);

            const message =
                err.response?.data?.message ||
                (err.response?.status === 403
                    ? "You are not authorized to update this application."
                    : "Unable to update the application status.");

            setNotice({
                type: "error",
                message,
            });
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                <span className="h-2 w-2 rounded-full bg-blue-600" />
                                RECRUITER WORKSPACE
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Applications Dashboard
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Review applicants, track hiring progress, and
                                manage candidate application statuses.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchApplications}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span aria-hidden="true">↻</span>
                            Refresh applications
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
                        description="Applications for your jobs"
                        icon="▤"
                        color="blue"
                    />

                    <StatCard
                        title="Shortlisted"
                        value={statistics.shortlisted}
                        description="Candidates shortlisted"
                        icon="★"
                        color="violet"
                    />

                    <StatCard
                        title="Selected"
                        value={statistics.selected}
                        description="Candidates selected"
                        icon="✓"
                        color="emerald"
                    />

                    <StatCard
                        title="Rejected"
                        value={statistics.rejected}
                        description="Applications rejected"
                        icon="×"
                        color="rose"
                    />
                </section>

                {/* Notification */}
                {notice && (
                    <div
                        role="status"
                        className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                            notice.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-rose-200 bg-rose-50 text-rose-800"
                        }`}
                    >
                        {notice.message}
                    </div>
                )}

                {/* Applications section */}
                <section className="mt-10">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Candidate Applications
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Search and review candidates who applied to
                                your job postings.
                            </p>
                        </div>

                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-900">
                                {filteredApplications.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-900">
                                {applications.length}
                            </span>{" "}
                            applications
                        </p>
                    </div>

                    {/* Search and filters */}
                    <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_230px]">
                        <div className="relative">
                            <span
                                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by candidate, email, or job title..."
                                aria-label="Search applications"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            aria-label="Filter by application status"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                            <option value="ALL">All statuses</option>

                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {formatStatus(status)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                            <p className="mt-4 text-sm font-medium text-slate-600">
                                Loading applications...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
                            <div className="text-3xl text-rose-500">!</div>

                            <h3 className="mt-3 text-lg font-semibold text-slate-900">
                                Could not load applications
                            </h3>

                            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={fetchApplications}
                                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty results */}
                    {!loading && !error && filteredApplications.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
                                ▤
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-slate-900">
                                {applications.length === 0
                                    ? "No applications yet"
                                    : "No matching applications"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {applications.length === 0
                                    ? "When candidates apply to your job postings, their applications will appear here."
                                    : "Try changing your search term or selecting a different status filter."}
                            </p>

                            {(search || statusFilter !== "ALL") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter("ALL");
                                    }}
                                    className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Applicant cards */}
                    {!loading && !error && filteredApplications.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {filteredApplications.map((application) => {
                                const candidateName =
                                    application.candidateName || "Unknown candidate";

                                const initials = candidateName
                                    .trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map((part) => part.charAt(0))
                                    .join("")
                                    .toUpperCase();

                                return (
                                    <article
                                        key={application.applicationId}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                                    >
                                        <div className="p-5 sm:p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
                                                    {initials || "?"}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="break-words text-lg font-bold text-slate-900">
                                                        {candidateName}
                                                    </h3>

                                                    <p className="mt-1 break-all text-sm text-slate-500">
                                                        {application.candidateEmail ||
                                                            "Email unavailable"}
                                                    </p>
                                                </div>

                                                <div className="shrink-0">
                                                    <StatusBadge
                                                        status={application.status}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    Applied for
                                                </p>

                                                <p className="mt-2 break-words font-semibold text-slate-800">
                                                    {application.jobTitle ||
                                                        "Job title unavailable"}
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                                                    <span>
                                                        Application ID:{" "}
                                                        {application.applicationId}
                                                    </span>

                                                    <span>
                                                        Applied:{" "}
                                                        {formatDate(
                                                            application.applicationDate
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <label
                                                    htmlFor={`status-${application.applicationId}`}
                                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                                >
                                                    Update application status
                                                </label>

                                                <div className="flex flex-col gap-3 sm:flex-row">
                                                    <select
                                                        id={`status-${application.applicationId}`}
                                                        value={
                                                            application.status || "APPLIED"
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            application.applicationId
                                                        }
                                                        onChange={(event) =>
                                                            updateStatus(
                                                                application.applicationId,
                                                                event.target.value
                                                            )
                                                        }
                                                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
                                                    >
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {formatStatus(status)}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {updatingId ===
                                                        application.applicationId && (
                                                        <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                                                            Saving...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            <footer className="mt-12 border-t border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
                    JobConnect Recruiter Workspace
                </div>
            </footer>
        </div>
    );
}

export default RecruiterApplications;