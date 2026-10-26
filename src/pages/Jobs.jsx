import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Jobs() {
    const navigate = useNavigate();
    const location = useLocation();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [employmentFilter, setEmploymentFilter] = useState("ALL");
    const [applicationMessage, setApplicationMessage] = useState("");
    const [applicationError, setApplicationError] = useState("");
    const [applyingJobId, setApplyingJobId] = useState(null);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role")?.toUpperCase();

    const isCandidate = Boolean(token) && role === "CANDIDATE";
    const isRecruiter = Boolean(token) && role === "RECRUITER";
    const isAdmin = Boolean(token) && role === "ADMIN";

    // Read search term from the Home page URL.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchTerm(params.get("search") || "");
    }, [location.search]);

    // Fetch jobs from the backend.
    useEffect(() => {
        let isMounted = true;

        const fetchJobs = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/jobs");

                if (isMounted) {
                    setJobs(
                        Array.isArray(response.data)
                            ? response.data.filter(
                                  (job) => job.active !== false
                              )
                            : []
                    );
                }
            } catch (err) {
                console.error("Error fetching jobs:", err);

                if (isMounted) {
                    setError(
                        "Unable to load jobs. Please check your connection and try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchJobs();

        return () => {
            isMounted = false;
        };
    }, []);

    const employmentTypes = useMemo(() => {
        const types = jobs
            .map((job) => job.employmentType)
            .filter(Boolean);

        return [...new Set(types)].sort();
    }, [jobs]);

    // Search and filter jobs.
    const filteredJobs = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        return jobs.filter((job) => {
            const searchableText = [
                job.title,
                job.description,
                job.location,
                job.skills,
                job.employmentType,
            ]
                .map((value) => String(value ?? ""))
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query || searchableText.includes(query);

            const matchesEmployment =
                employmentFilter === "ALL" ||
                job.employmentType === employmentFilter;

            return matchesSearch && matchesEmployment;
        });
    }, [jobs, searchTerm, employmentFilter]);

    const formatSalary = (salary) => {
        if (salary === null || salary === undefined || salary === "") {
            return "Not specified";
        }

        return Number(salary).toLocaleString("en-IN");
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);

        const params = new URLSearchParams(location.search);

        if (value.trim()) {
            params.set("search", value);
        } else {
            params.delete("search");
        }

        navigate(
            {
                pathname: "/jobs",
                search: params.toString() ? `?${params.toString()}` : "",
            },
            { replace: true }
        );
    };

    const handleApply = async (jobId) => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (!isCandidate) {
            setApplicationError(
                "Only candidate accounts can apply for jobs."
            );
            setApplicationMessage("");
            return;
        }

        setApplyingJobId(jobId);
        setApplicationError("");
        setApplicationMessage("");

        try {
            await api.post("/applications", { jobId });

            setApplicationMessage(
                "Application submitted successfully!"
            );
        } catch (err) {
            console.error("Failed to apply:", err);

            const status = err.response?.status;

            if (status === 409) {
                setApplicationError(
                    "You have already applied for this job."
                );
            } else if (status === 401) {
                setApplicationError(
                    "Your session has expired. Please log in again."
                );
            } else if (status === 403) {
                setApplicationError(
                    "You do not have permission to apply for this job."
                );
            } else {
                setApplicationError(
                    err.response?.data?.message ||
                        "Unable to submit your application. Please try again."
                );
            }
        } finally {
            setApplyingJobId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* Navigation */}
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex items-center gap-3"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm">
                            J
                        </span>

                        <span className="text-xl font-extrabold tracking-tight text-slate-900">
                            Job<span className="text-blue-600">Connect</span>
                        </span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                        {isCandidate && (
                            <button
                                type="button"
                                onClick={() => navigate("/candidate")}
                                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                            >
                                My Dashboard
                            </button>
                        )}

                        {isRecruiter && (
                            <button
                                type="button"
                                onClick={() => navigate("/recruiter")}
                                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                            >
                                Recruiter Dashboard
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                            >
                                Home
                            </button>
                        )}

                        {!token && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Login
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                {/* Page heading */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
                    <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" />

                    <div className="relative max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-50">
                            Career opportunities
                        </span>

                        <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
                            Find a job that moves you forward.
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-blue-100 sm:text-lg">
                            Discover opportunities, explore new career paths,
                            and find roles that match your skills and goals.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-blue-50">
                            <span className="rounded-lg bg-white/10 px-3 py-2">
                                ✓ Explore opportunities
                            </span>

                            <span className="rounded-lg bg-white/10 px-3 py-2">
                                ✓ Apply online
                            </span>

                            <span className="rounded-lg bg-white/10 px-3 py-2">
                                ✓ Track applications
                            </span>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                {applicationMessage && (
                    <div
                        role="status"
                        className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
                    >
                        {applicationMessage}
                    </div>
                )}

                {applicationError && (
                    <div
                        role="alert"
                        className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"
                    >
                        {applicationError}
                    </div>
                )}

                {/* Search and filters */}
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px_auto]">
                        <div>
                            <label
                                htmlFor="job-search"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Search opportunities
                            </label>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                                <span
                                    aria-hidden="true"
                                    className="text-xl text-blue-600"
                                >
                                    ⌕
                                </span>

                                <input
                                    id="job-search"
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        handleSearchChange(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Job title, skill, or location..."
                                    className="w-full min-w-0 border-0 bg-transparent py-3 text-sm outline-none focus:ring-0"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="employment-filter"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Employment type
                            </label>

                            <select
                                id="employment-filter"
                                value={employmentFilter}
                                onChange={(event) =>
                                    setEmploymentFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            >
                                <option value="ALL">All employment types</option>

                                {employmentTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setEmploymentFilter("ALL");
                                    handleSearchChange("");
                                    setApplicationMessage("");
                                    setApplicationError("");
                                }}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:w-auto"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {!loading && !error && (
                        <p className="mt-4 text-sm text-slate-500">
                            Found{" "}
                            <span className="font-bold text-slate-900">
                                {filteredJobs.length}
                            </span>{" "}
                            {filteredJobs.length === 1 ? "job" : "jobs"}
                        </p>
                    )}
                </section>

                {/* Job listings */}
                <section className="mt-10">
                    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                                Job listings
                            </p>

                            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                                Available Jobs
                            </h2>
                        </div>

                        {!isRecruiter && !isAdmin && (
                            <p className="text-sm text-slate-500">
                                Find your next opportunity today.
                            </p>
                        )}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-slate-200" />
                                    <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />
                                    <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                                    <div className="mt-6 h-4 w-full rounded bg-slate-100" />
                                    <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
                                    <div className="mt-6 h-10 rounded-lg bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Fetch error */}
                    {!loading && error && (
                        <div
                            role="alert"
                            className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8"
                        >
                            <h3 className="font-bold text-red-800">
                                Unable to load jobs
                            </h3>

                            <p className="mt-2 text-sm text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* No jobs */}
                    {!loading && !error && jobs.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <div className="text-4xl">💼</div>

                            <h3 className="mt-4 text-xl font-bold text-slate-900">
                                No active jobs available
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                There are no active job postings right now.
                                Please check back later.
                            </p>
                        </div>
                    )}

                    {/* No search results */}
                    {!loading &&
                        !error &&
                        jobs.length > 0 &&
                        filteredJobs.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                                <div className="text-4xl">🔎</div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    No matching jobs found
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Try another keyword or change your
                                    employment filter.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmploymentFilter("ALL");
                                        handleSearchChange("");
                                    }}
                                    className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Show All Jobs
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

                                            <span className="max-w-40 rounded-full bg-blue-50 px-3 py-1.5 text-right text-xs font-bold text-blue-700">
                                                {job.employmentType ||
                                                    "Employment type not specified"}
                                            </span>
                                        </div>

                                        <h3 className="mt-5 break-words text-xl font-bold leading-snug text-slate-900">
                                            {job.title}
                                        </h3>

                                        <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                                            <span aria-hidden="true">⌖</span>

                                            <span className="break-words">
                                                {job.location ||
                                                    "Location not specified"}
                                            </span>
                                        </p>

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
                                        </div>

                                        {job.description && (
                                            <p className="mt-5 line-clamp-3 break-words text-sm leading-6 text-slate-600">
                                                {job.description}
                                            </p>
                                        )}

                                        <div className="mt-5">
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Required Skills
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {job.skills
                                                    ?.split(",")
                                                    .map((skill) => skill.trim())
                                                    .filter(Boolean)
                                                    .slice(0, 6)
                                                    .map((skill, index) => (
                                                        <span
                                                            key={`${skill}-${index}`}
                                                            className="max-w-full break-words rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}

                                                {!job.skills?.trim() && (
                                                    <span className="text-sm text-slate-400">
                                                        Not specified
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto border-t border-slate-100 pt-5">
                                            {isRecruiter || isAdmin ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            isRecruiter
                                                                ? "/recruiter"
                                                                : "/"
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    {isRecruiter
                                                        ? "Manage My Jobs"
                                                        : "Back to Home"}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleApply(job.id)
                                                    }
                                                    disabled={
                                                        applyingJobId === job.id
                                                    }
                                                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {applyingJobId === job.id
                                                        ? "Applying..."
                                                        : token
                                                          ? "Apply Now →"
                                                          : "Login to Apply →"}
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                </section>

                {/* Bottom CTA */}
                {!token && (
                    <section className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Ready for your next career move?
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Create a candidate account to apply for
                                    available jobs and track your applications.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Create Account
                            </button>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-10 border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        © {new Date().getFullYear()} JobConnect. All rights
                        reserved.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="self-start font-semibold text-blue-600 transition hover:text-blue-800 md:self-auto"
                    >
                        Back to Home ↑
                    </button>
                </div>
            </footer>
        </div>
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

export default Jobs;