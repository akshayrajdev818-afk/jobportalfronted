import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Home() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await api.get("/jobs");
                setJobs(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const featuredJobs = jobs
        .filter((job) => job.active !== false)
        .slice(0, 3);

    const handleSearch = (event) => {
        event.preventDefault();

        navigate(
            searchTerm.trim()
                ? `/jobs?search=${encodeURIComponent(searchTerm.trim())}`
                : "/jobs"
        );
    };

    const formatSalary = (salary) => {
        if (salary === null || salary === undefined || salary === "") {
            return "Not specified";
        }

        return Number(salary).toLocaleString("en-IN");
    };

    return (
        <div className="min-h-screen bg-white text-slate-800">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2.5"
                        aria-label="JobConnect home"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm">
                            J
                        </span>

                        <span className="text-xl font-extrabold tracking-tight text-slate-900">
                            Job<span className="text-blue-600">Connect</span>
                        </span>
                    </button>

                    <div className="hidden items-center gap-8 md:flex">
                        <a
                            href="#home"
                            className="text-sm font-semibold text-blue-600"
                        >
                            Home
                        </a>

                        <button
                            onClick={() => navigate("/jobs")}
                            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
                        >
                            Browse Jobs
                        </button>

                        <a
                            href="#why-us"
                            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
                        >
                            Why JobConnect?
                        </a>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => navigate("/login")}
                            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:px-5"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <main>
                <section
                    id="home"
                    className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50"
                >
                    <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Your next opportunity starts here
                            </div>

                            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                Discover a career that{" "}
                                <span className="text-blue-600">
                                    moves you forward.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                                Explore job opportunities, connect with
                                employers, and take the next step in your
                                professional journey with JobConnect.
                            </p>

                            <form
                                onSubmit={handleSearch}
                                className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-blue-100/50 sm:flex-row"
                            >
                                <label
                                    htmlFor="home-job-search"
                                    className="sr-only"
                                >
                                    Search jobs by title, skills, or location
                                </label>

                                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                                    <span
                                        aria-hidden="true"
                                        className="text-xl text-blue-600"
                                    >
                                        ⌕
                                    </span>

                                    <input
                                        id="home-job-search"
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Job title, skills, or location"
                                        className="w-full min-w-0 border-0 bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Search Jobs
                                </button>
                            </form>

                            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                                <span className="font-semibold text-slate-700">
                                    Popular actions:
                                </span>

                                <button
                                    onClick={() => navigate("/jobs")}
                                    className="transition hover:text-blue-600"
                                >
                                    Browse jobs
                                </button>

                                <button
                                    onClick={() => navigate("/register")}
                                    className="transition hover:text-blue-600"
                                >
                                    Create an account
                                </button>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <button
                                    onClick={() => navigate("/jobs")}
                                    className="rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Explore Opportunities →
                                </button>

                                <button
                                    onClick={() => navigate("/register")}
                                    className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                                >
                                    Join JobConnect
                                </button>
                            </div>
                        </div>

                        {/* Hero visual built with Tailwind */}
                        <div className="relative mx-auto w-full max-w-lg">
                            <div className="absolute -right-3 top-8 h-32 w-32 rounded-full bg-blue-200/50 blur-2xl" />

                            <div className="relative rounded-3xl border border-white bg-white p-5 shadow-2xl shadow-blue-200/50 sm:p-7">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Your career journey
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                                            Find your next role
                                        </h2>
                                    </div>

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                                        💼
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <OpportunityItem
                                        icon="💻"
                                        title="Software Developer"
                                        category="Technology"
                                        color="bg-blue-50"
                                    />

                                    <OpportunityItem
                                        icon="📊"
                                        title="Data Analyst"
                                        category="Data & Analytics"
                                        color="bg-violet-50"
                                    />

                                    <OpportunityItem
                                        icon="🎨"
                                        title="UI/UX Designer"
                                        category="Design"
                                        color="bg-amber-50"
                                    />
                                </div>

                                <button
                                    onClick={() => navigate("/jobs")}
                                    className="mt-6 w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Discover Opportunities →
                                </button>
                            </div>

                            <div className="relative mt-5 flex items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:absolute sm:-bottom-6 sm:-left-8 sm:mt-0 sm:justify-start sm:shadow-lg">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl">
                                    ✓
                                </span>

                                <div>
                                    <p className="text-sm font-bold text-emerald-900">
                                        Your next step starts today
                                    </p>

                                    <p className="mt-1 text-xs text-emerald-700">
                                        Explore opportunities that match you
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATISTICS */}
                <section className="border-y border-slate-100 bg-white">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
                        <Statistic
                            value={loading ? "..." : jobs.length}
                            label="Job postings available"
                        />

                        <Statistic
                            value="3"
                            label="Simple steps: Explore, Apply, Grow"
                        />

                        <Statistic
                            value="24/7"
                            label="Explore opportunities anytime"
                        />
                    </div>
                </section>

                {/* FEATURED JOBS */}
                <section className="bg-slate-50 py-16 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                                    Opportunities
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                    Explore featured jobs
                                </h2>

                                <p className="mt-3 max-w-xl text-slate-600">
                                    Discover opportunities posted by recruiters
                                    on JobConnect.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/jobs")}
                                className="self-start rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 sm:self-auto"
                            >
                                View All Jobs →
                            </button>
                        </div>

                        {loading ? (
                            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-slate-200" />
                                        <div className="mt-5 h-5 w-2/3 rounded bg-slate-200" />
                                        <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                                        <div className="mt-6 h-10 rounded-lg bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        ) : featuredJobs.length > 0 ? (
                            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {featuredJobs.map((job) => (
                                    <article
                                        key={job.id}
                                        className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-700">
                                                {String(job.title || "J")
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>

                                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                                {job.employmentType ||
                                                    "Opportunity"}
                                            </span>
                                        </div>

                                        <h3 className="mt-5 break-words text-xl font-bold text-slate-900">
                                            {job.title}
                                        </h3>

                                        <p className="mt-2 text-sm text-slate-500">
                                            📍{" "}
                                            {job.location ||
                                                "Location not specified"}
                                        </p>

                                        <div className="mt-5 space-y-2 text-sm text-slate-600">
                                            <p>
                                                <span className="font-semibold text-slate-800">
                                                    Salary:
                                                </span>{" "}
                                                ₹{formatSalary(job.salaryMin)} – ₹
                                                {formatSalary(job.salaryMax)}
                                            </p>

                                            <p>
                                                <span className="font-semibold text-slate-800">
                                                    Experience:
                                                </span>{" "}
                                                {job.experienceRequired ??
                                                    "Not specified"}
                                                {job.experienceRequired !==
                                                    null &&
                                                job.experienceRequired !==
                                                    undefined
                                                    ? " years"
                                                    : ""}
                                            </p>
                                        </div>

                                        {job.skills && (
                                            <p className="mt-4 line-clamp-2 break-words text-sm text-slate-500">
                                                <span className="font-semibold text-slate-700">
                                                    Skills:
                                                </span>{" "}
                                                {job.skills}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => navigate("/jobs")}
                                            className="mt-auto pt-6 text-left text-sm font-bold text-blue-600 transition hover:text-blue-800"
                                        >
                                            Explore this opportunity →
                                        </button>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                                <div className="text-4xl">💼</div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    New opportunities are waiting
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    No active job postings are available to
                                    feature right now. Check back soon.
                                </p>

                                <button
                                    onClick={() => navigate("/jobs")}
                                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Browse All Jobs
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* WHY JOBCONNECT */}
                <section
                    id="why-us"
                    className="bg-white py-16 sm:py-20"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                                Why JobConnect?
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Make your next career move with confidence
                            </h2>

                            <p className="mt-4 leading-7 text-slate-600">
                                Everything you need to discover opportunities
                                and take the next step in your career.
                            </p>
                        </div>

                        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon="🎯"
                                title="Explore Opportunities"
                                description="Discover job postings and explore roles that match your interests and skills."
                            />

                            <FeatureCard
                                icon="⚡"
                                title="Simple Application Process"
                                description="Create an account and apply for opportunities through a straightforward workflow."
                            />

                            <FeatureCard
                                icon="🔐"
                                title="Secure Accounts"
                                description="Sign in to your account and access features designed for your role."
                            />

                            <FeatureCard
                                icon="📋"
                                title="Track Applications"
                                description="Keep track of your applications and check their current status."
                            />

                            <FeatureCard
                                icon="🤝"
                                title="Recruiter Workspace"
                                description="Recruiters can publish job postings and manage incoming applications."
                            />

                            <FeatureCard
                                icon="📱"
                                title="Responsive Experience"
                                description="Use JobConnect on desktop, tablet, or mobile with a responsive interface."
                            />
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="bg-slate-50 py-16 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                                Get Started
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Three simple steps
                            </h2>
                        </div>

                        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                            <StepCard
                                number="01"
                                title="Create Your Account"
                                description="Register as a candidate to begin exploring job opportunities."
                            />

                            <StepCard
                                number="02"
                                title="Explore Opportunities"
                                description="Browse available positions and find roles that interest you."
                            />

                            <StepCard
                                number="03"
                                title="Apply and Track"
                                description="Submit applications and follow their progress from your dashboard."
                            />
                        </div>
                    </div>
                </section>

                {/* CALL TO ACTION */}
                <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
                        <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                            Your future starts here
                        </p>

                        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Ready to discover your next opportunity?
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
                            Join JobConnect to explore available positions,
                            apply for jobs, and take your career forward.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                onClick={() => navigate("/register")}
                                className="rounded-xl bg-white px-7 py-3.5 font-bold text-blue-700 transition hover:bg-blue-50"
                            >
                                Create Your Account →
                            </button>

                            <button
                                onClick={() => navigate("/jobs")}
                                className="rounded-xl border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
                            >
                                Browse Jobs
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 self-start"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                            J
                        </span>

                        <span className="font-bold text-slate-900">
                            Job<span className="text-blue-600">Connect</span>
                        </span>
                    </button>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                        <button
                            onClick={() => navigate("/jobs")}
                            className="transition hover:text-blue-600"
                        >
                            Browse Jobs
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            className="transition hover:text-blue-600"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="transition hover:text-blue-600"
                        >
                            Register
                        </button>
                    </div>

                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} JobConnect
                    </p>
                </div>
            </footer>
        </div>
    );
}

function OpportunityItem({ icon, title, category, color }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
            <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${color}`}
            >
                {icon}
            </span>

            <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-900">
                    {title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">{category}</p>
            </div>

            <span className="ml-auto text-lg text-slate-400">→</span>
        </div>
    );
}

function Statistic({ value, label }) {
    return (
        <div className="text-center sm:border-r sm:border-slate-100 last:border-r-0">
            <p className="text-3xl font-extrabold tracking-tight text-blue-600">
                {value}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
                {label}
            </p>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                {icon}
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600">
                {description}
            </p>
        </article>
    );
}

function StepCard({ number, title, description }) {
    return (
        <article className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-sm font-extrabold tracking-widest text-blue-600">
                STEP {number}
            </span>

            <h3 className="mt-4 text-xl font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600">
                {description}
            </p>
        </article>
    );
}

export default Home;