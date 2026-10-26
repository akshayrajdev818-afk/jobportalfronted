import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import RecruiterApplications from "./pages/RecruiterApplications";
import TailwindTest from "./pages/TailwindTest";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/jobs" element={<Jobs />} />

                <Route
    path="/candidate"
    element={<CandidateDashboard />}
/>
<Route
    path="/recruiter"
    element={<RecruiterDashboard />}
/>
<Route
    path="/create-job"
    element={<CreateJob />}
/>

<Route path="/edit-job/:id" element={<EditJob />} />

<Route
    path="/recruiter-applications"
    element={<RecruiterApplications />}
/>


<Route path="/tailwind-test" element={<TailwindTest />} />

            </Routes>

        </BrowserRouter>
    );
}

export default App; 