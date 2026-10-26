import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateJob() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        experienceRequired: "",
        employmentType: "FULL_TIME",
        skills: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    // Submit job details to Spring Boot
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
            setError(
                "Minimum salary cannot be greater than maximum salary."
            );
            return;
        }

        setLoading(true);

        try {
            const jobData = {
                ...formData,
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                experienceRequired: Number(
                    formData.experienceRequired
                )
            };

            const response = await api.post("/jobs", jobData);

            setMessage("Job created successfully!");

            console.log("Created job:", response.data);

            setFormData({
                title: "",
                description: "",
                location: "",
                salaryMin: "",
                salaryMax: "",
                experienceRequired: "",
                employmentType: "FULL_TIME",
                skills: ""
            });

            setTimeout(() => {
                navigate("/jobs");
            }, 1500);

        } catch (err) {
            console.error("Create job error:", err);

            if (err.response?.status === 401) {
                setError("Please log in to continue.");
            } else if (err.response?.status === 403) {
                setError(
                    "Access denied. Please log in with a recruiter account."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to create job. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-job-container">

            <h1>Create a Job Posting</h1>

            <p>Enter the details of the job you want to publish.</p>

            {message && (
                <p className="success-message">
                    {message}
                </p>
            )}

            {error && (
                <p className="error-message">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                {/* Job Title */}
                <div className="form-group">
                    <label htmlFor="title">Job Title</label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="e.g. Java Developer"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Job Description */}
                <div className="form-group">
                    <label htmlFor="description">
                        Job Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        placeholder="Describe the job responsibilities..."
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        required
                    />
                </div>

                {/* Location */}
                <div className="form-group">
                    <label htmlFor="location">Location</label>

                    <input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="e.g. Pune"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Minimum Salary */}
                <div className="form-group">
                    <label htmlFor="salaryMin">
                        Minimum Salary
                    </label>

                    <input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min="0"
                        placeholder="e.g. 300000"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Maximum Salary */}
                <div className="form-group">
                    <label htmlFor="salaryMax">
                        Maximum Salary
                    </label>

                    <input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min="0"
                        placeholder="e.g. 600000"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Experience */}
                <div className="form-group">
                    <label htmlFor="experienceRequired">
                        Required Experience (years)
                    </label>

                    <input
                        id="experienceRequired"
                        name="experienceRequired"
                        type="number"
                        min="0"
                        placeholder="e.g. 2"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Employment Type */}
                <div className="form-group">
                    <label htmlFor="employmentType">
                        Employment Type
                    </label>

                    <select
                        id="employmentType"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                    >
                        <option value="FULL_TIME">
                            Full Time
                        </option>

                        <option value="PART_TIME">
                            Part Time
                        </option>

                        <option value="CONTRACT">
                            Contract
                        </option>

                        <option value="INTERNSHIP">
                            Internship
                        </option>
                    </select>
                </div>

                {/* Skills */}
                <div className="form-group">
                    <label htmlFor="skills">
                        Required Skills
                    </label>

                    <input
                        id="skills"
                        name="skills"
                        type="text"
                        placeholder="Java, Spring Boot, MySQL"
                        value={formData.skills}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Buttons */}
                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Creating Job..." : "Publish Job"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/recruiter")}
                >
                    Cancel
                </button>

            </form>
        </div>
    );
}

export default CreateJob;