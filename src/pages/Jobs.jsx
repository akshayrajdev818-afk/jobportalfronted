import { useEffect, useState } from "react";
import api from "../services/api";

function Jobs() {

    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchJobs = async () => {

            try {

                const response = await api.get("/jobs");

                setJobs(response.data);

            } catch (error) {

                console.error("Error fetching jobs:", error);

                setError("Failed to load jobs.");
            }
        };

        fetchJobs();

    }, []);

    return (
        <div>

            <h1>Available Jobs</h1>

            {error && <p>{error}</p>}

            {jobs.length === 0 && !error && (
                <p>No jobs available.</p>
            )}

            {jobs.map((job) => (

                <div key={job.id}>

                    <h2>{job.title}</h2>

                    <p>
                        <strong>Description:</strong>{" "}
                        {job.description}
                    </p>

                    <p>
                        <strong>Location:</strong>{" "}
                        {job.location}
                    </p>

                    <p>
                        <strong>Salary:</strong>{" "}
                        ₹{job.salaryMin} - ₹{job.salaryMax}
                    </p>

                    <p>
                        <strong>Experience:</strong>{" "}
                        {job.experienceRequired} years
                    </p>

                    <p>
                        <strong>Employment Type:</strong>{" "}
                        {job.employmentType}
                    </p>

                    <p>
                        <strong>Skills:</strong>{" "}
                        {job.skills}
                    </p>

                    <hr />

                </div>

            ))}

        </div>
    );
}

export default Jobs;