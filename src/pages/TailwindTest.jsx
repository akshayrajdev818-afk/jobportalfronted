function TailwindTest() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">
                    JobConnect
                </h1>

                <p className="text-slate-600 mb-6">
                    Tailwind CSS is working successfully!
                </p>

                <button className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition">
                    Get Started
                </button>
            </div>
        </div>
    );
}

export default TailwindTest;