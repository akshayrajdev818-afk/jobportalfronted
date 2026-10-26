import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function RecruiterDashboard() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [deletingJobId, setDeletingJobId] = useState(null);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            setError("");

            const response = await api.get("/jobs/my-jobs");
            setJobs(response.data);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);

            setError(
                err.response?.status === 401
                    ? "Your session has expired. Please log in again."
                    : err.response?.status === 403
                      ? "You do not have permission to view these job postings."
                      : "Unable to load your job postings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job posting?"
        );

        if (!confirmed) return;

        setDeletingJobId(jobId);
        setError("");

        try {
            await api.delete(`/jobs/${jobId}`);

            setJobs((previousJobs) =>
                previousJobs.filter((job) => job.id !== jobId)
            );
        } catch (err) {
            console.error("Failed to delete job:", err);
            setError(
                err.response?.data?.message ||
                    "Unable to delete this job. Please try again."
            );
        } finally {
            setDeletingJobId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
    };

    const filteredJobs = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return jobs.filter((job) => {
            const matchesSearch =
                !query ||
                [
                    job.title,
                    job.location,
                    job.employmentType,
                    job.skills,
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(query)
                );

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && job.active) ||
                (statusFilter === "INACTIVE" && !job.active);

            return matchesSearch && matchesStatus;
        });
    }, [jobs, searchTerm, statusFilter]);

    const activeJobs = jobs.filter((job) => job.active).length;
    const inactiveJobs = jobs.length - activeJobs;

    const formatSalary = (salary) => {
        if (salary === null || salary === undefined || salary === "") {
            return "Not specified";
        }

        return Number(salary).toLocaleString("en-IN");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* Navigation */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex items-center gap-3 text-left"
                        aria-label="Go to JobConnect home"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm">
                            J
                        </span>

                        <span>
                            <span className="block text-xl font-bold tracking-tight text-slate-900">
                                JobConnect
                            </span>
                            <span className="block text-xs text-slate-500">
                                Recruiter workspace
                            </span>
                        </span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/jobs")}
                            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                            Browse Jobs
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/create-job")}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <span aria-hidden="true">+</span> Create Job
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                {/* Welcome section */}
                <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg sm:p-9">
                    <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-white/5" />

                    <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div className="max-w-2xl">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-50">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                Recruiter Dashboard
                            </span>

                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Find your next great hire.
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                                Manage your job postings, track active
                                opportunities, and connect with candidates—all
                                in one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/create-job")}
                            className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50"
                        >
                            + Post a New Job
                        </button>
                    </div>
                </section>

                {/* Statistics */}
                <section
                    aria-label="Job posting statistics"
                    className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <StatCard
                        title="Total Job Postings"
                        value={loading ? "—" : jobs.length}
                        description="All your job listings"
                        icon="▤"
                        iconClass="bg-blue-50 text-blue-700"
                    />

                    <StatCard
                        title="Active Jobs"
                        value={loading ? "—" : activeJobs}
                        description="Currently marked active"
                        icon="✓"
                        iconClass="bg-emerald-50 text-emerald-700"
                    />

                    <StatCard
                        title="Inactive Jobs"
                        value={loading ? "—" : inactiveJobs}
                        description="Currently marked inactive"
                        icon="◷"
                        iconClass="bg-amber-50 text-amber-700"
                    />
                </section>

                {/* Job listings */}
                <section>
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                                Your workspace
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                My Job Postings
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                View and manage the opportunities you have
                                posted.
                            </p>
                        </div>

                        {!loading && jobs.length > 0 && (
                            <p className="text-sm font-medium text-slate-500">
                                Showing{" "}
                                <span className="font-bold text-slate-800">
                                    {filteredJobs.length}
                                </span>{" "}
                                of {jobs.length} jobs
                            </p>
                        )}
                    </div>

                    {/* Search and filters */}
                    {!loading && jobs.length > 0 && (
                        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
                            <div className="relative min-w-0 flex-1">
                                <label
                                    htmlFor="job-search"
                                    className="sr-only"
                                >
                                    Search job postings
                                </label>

                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
                                >
                                    ⌕
                                </span>

                                <input
                                    id="job-search"
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search title, location, skills..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <label className="sr-only" htmlFor="job-status">
                                Filter jobs by status
                            </label>

                            <select
                                id="job-status"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="ALL">All statuses</option>
                                <option value="ACTIVE">Active only</option>
                                <option value="INACTIVE">Inactive only</option>
                            </select>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <div className="mb-4 h-5 w-2/3 rounded bg-slate-200" />
                                    <div className="mb-3 h-4 w-1/2 rounded bg-slate-100" />
                                    <div className="mb-3 h-4 w-3/4 rounded bg-slate-100" />
                                    <div className="mb-6 h-4 w-1/2 rounded bg-slate-100" />
                                    <div className="h-10 rounded-lg bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-bold text-red-800">
                                        Something went wrong
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-red-700">
                                        {error}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={fetchMyJobs}
                                    className="shrink-0 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && jobs.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center sm:px-10">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-600">
                                +
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                Your next hire starts here
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                You haven't posted any jobs yet. Create your
                                first listing and start connecting with
                                potential candidates.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/create-job")}
                                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                Create Your First Job
                            </button>
                        </div>
                    )}

                    {/* No search results */}
                    {!loading &&
                        !error &&
                        jobs.length > 0 &&
                        filteredJobs.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                                <h3 className="text-lg font-bold text-slate-900">
                                    No matching jobs found
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Try a different search term or change the
                                    status filter.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("ALL");
                                    }}
                                    className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                    {/* Job cards */}
                    {!loading &&
                        !error &&
                        filteredJobs.length > 0 && (
                            <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {filteredJobs.map((job) => (
                                    <article
                                        key={job.id}
                                        className="group flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                                                {String(job.title || "J")
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <span
                                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                                                    job.active
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        job.active
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400"
                                                    }`}
                                                />
                                                {job.active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="mt-5">
                                            <h3 className="break-words text-xl font-bold leading-snug text-slate-900">
                                                {job.title}
                                            </h3>

                                            <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                                                <span aria-hidden="true">
                                                    ⌖
                                                </span>
                                                <span className="break-words">
                                                    {job.location ||
                                                        "Location not specified"}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                                            <JobDetail
                                                label="Salary"
                                                value={`₹${formatSalary(
                                                    job.salaryMin
                                                )} – ₹${formatSalary(
                                                    job.salaryMax
                                                )}`}
                                            />

                                            <JobDetail
                                                label="Experience"
                                                value={
                                                    job.experienceRequired ===
                                                        null ||
                                                    job.experienceRequired ===
                                                        undefined
                                                        ? "Not specified"
                                                        : `${job.experienceRequired} years`
                                                }
                                            />

                                            <JobDetail
                                                label="Employment"
                                                value={
                                                    job.employmentType ||
                                                    "Not specified"
                                                }
                                            />
                                        </div>

                                        <div className="mt-5">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Required Skills
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {job.skills
                                                    ?.split(",")
                                                    .map((skill) => skill.trim())
                                                    .filter(Boolean)
                                                    .slice(0, 5)
                                                    .map((skill, index) => (
                                                        <span
                                                            key={`${skill}-${index}`}
                                                            className="max-w-full break-words rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}

                                                {!job.skills?.trim() && (
                                                    <span className="text-sm text-slate-400">
                                                        No skills specified
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/edit-job/${job.id}`
                                                    )
                                                }
                                                className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Edit Job
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(job.id)
                                                }
                                                disabled={
                                                    deletingJobId === job.id
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {deletingJobId === job.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        "/recruiter-applications"
                                                    )
                                                }
                                                className="col-span-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                View Applications →
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                </section>

                {/* Footer */}
                <footer className="mt-12 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
                    <p>
                        © {new Date().getFullYear()} JobConnect. Built to
                        connect great talent with great opportunities.
                    </p>
                </footer>
            </main>
        </div>
    );
}

function StatCard({ title, value, description, icon, iconClass }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${iconClass}`}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            </div>
        </article>
    );
}

function JobDetail({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-slate-500">{label}</span>

            <span className="break-words text-right font-semibold text-slate-800">
                {value}
            </span>
        </div>
    );
}

export default RecruiterDashboard;