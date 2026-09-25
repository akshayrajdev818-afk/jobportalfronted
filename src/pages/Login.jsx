import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();
        setError("");

        try {

            const response = await api.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            if (response.data.role === "CANDIDATE") {
                navigate("/candidate");
            }
            else if (response.data.role === "RECRUITER") {
                navigate("/recruiter");
            }
            else if (response.data.role === "ADMIN") {
                navigate("/admin");
            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div>

            <h2>Login</h2>

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}

export default Login;