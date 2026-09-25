import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CANDIDATE");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        const userData = {
            name,
            email,
            password,
            role,
            active: true
        };

        console.log("Sending:", userData);

        try {

            const response = await api.post(
                "/users",
                userData
            );

            console.log(
                "Registration response:",
                response.data
            );

            setMessage(
                "Registration successful!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div>

            <h2>Register</h2>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleRegister}>

    <label htmlFor="name">
        Name
    </label>

    <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
    />

    <br /><br />

    <label htmlFor="email">
        Email
    </label>

    <input
        id="email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
    />

    <br /><br />

    <label htmlFor="password">
        Password
    </label>

    <input
        id="password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
    />

    <br /><br />

    <label htmlFor="role">
        Role
    </label>

    <select
        id="role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
    >
        <option value="CANDIDATE">
            Candidate
        </option>

        <option value="RECRUITER">
            Recruiter
        </option>
    </select>

    <br /><br />

    <button type="submit">
        Register
    </button>

</form>

        </div>
    );
}

export default Register;