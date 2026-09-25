import { useNavigate } from "react-router-dom";

function Home() {

    const navigate = useNavigate();

    return (
        <div>

            <h1>Welcome to JobConnect</h1>

            <p>Find your next opportunity.</p>

            <button onClick={() => navigate("/jobs")}>
                Browse Jobs
            </button>

            <button onClick={() => navigate("/login")}>
                Login
            </button>

            <button onClick={() => navigate("/register")}>
                Register
            </button>

        </div>
    );
}

export default Home;