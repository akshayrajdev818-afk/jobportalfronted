import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        experienceRequired: "",
        employmentType: "FULL_TIME",
        skills: "",
        active: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Load existing job details
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/${id}`);
                const job = response.data;

                setFormData({
                    title: job.title ?? "",
                    description: job.description ?? "",
                    location: job.location ?? "",
                    salaryMin: job.salaryMin ?? "",
                    salaryMax: job.salaryMax ?? "",
                    experienceRequired: job.experienceRequired ?? "",
                    employmentType: job.employmentType ?? "FULL_TIME",
                    skills: job.skills ?? "",
                    active: job.active ?? true
                });
            } catch (err) {
                console.error("Failed to load job:", err);
                setError("Unable to load this job.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (Number(formData.salaryMin) > Number(formData.salaryMax)) {
            setError("Minimum salary cannot exceed maximum salary.");
            return;
        }

        setSaving(true);

        try {
            const updatedJob = {
                ...formData,
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                experienceRequired: Number(formData.experienceRequired)
            };

            await api.put(`/jobs/${id}`, updatedJob);

            setMessage("Job updated successfully!");

            setTimeout(() => {
                navigate("/recruiter");
            }, 1000);
        } catch (err) {
            console.error("Failed to update job:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please log in again.");
            } else if (err.response?.status === 403) {
                setError("You are not allowed to update this job.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to update job. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="edit-job-message">Loading job details...</p>;
    }

    if (error && !formData.title) {
        return (
            <div className="edit-job-container">
                <p className="error-message">{error}</p>
                <button onClick={() => navigate("/recruiter")}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="edit-job-container">
            <h1>Edit Job</h1>
            <p>Update your job posting details below.</p>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Job Title</label>
                    <input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Job Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="salaryMin">Minimum Salary</label>
                    <input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        min="0"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="salaryMax">Maximum Salary</label>
                    <input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        min="0"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="experienceRequired">
                        Required Experience (years)
                    </label>
                    <input
                        id="experienceRequired"
                        name="experienceRequired"
                        type="number"
                        min="0"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="employmentType">Employment Type</label>
                    <select
                        id="employmentType"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                    >
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="skills">Required Skills</label>
                    <input
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="active">Job Status</label>
                    <select
                        id="active"
                        name="active"
                        value={String(formData.active)}
                        onChange={(e) =>
                            setFormData((previousData) => ({
                                ...previousData,
                                active: e.target.value === "true"
                            }))
                        }
                    >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                <div className="edit-job-actions">
                    <button type="submit" disabled={saving}>
                        {saving ? "Updating..." : "Update Job"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/recruiter")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditJob;