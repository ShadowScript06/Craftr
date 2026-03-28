import LandingPage from "./pages/LandingPage";
import DashBoard from "./pages/DashBoard";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import JobsPage from "./pages/JobsPage";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/jobs" element={<JobsPage/>}/>
        
      </Routes>
    </div>
  );
}

export default App;
