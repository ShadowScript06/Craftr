import LandingPage from "./pages/LandingPage";
import DashBoard from "./pages/DashBoard";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import ApplicationTracker from "./pages/ApplicationTracker";
import ApplicationDetail from "./pages/ApplicationDetail";

import CreateInterviewPage from "./pages/CreateInterviewPage";
import InterviewDetail from "./pages/InterviewDetail";
import Session from "./pages/Session";
import Preparations from "./pages/Preparations";
import PreparationSession from "./pages/PreparationSession";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import ResumeFeedbackPage from "./pages/ResumeFeedbackPage";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/jobs" element={<JobsPage/>}/>
        <Route path="/jobs/:id" element={<JobDetail />} />

        <Route path="/applicationtracker" element={<ApplicationTracker/>}/>

        <Route path="/applicationtracker/:id" element={<ApplicationDetail />} />

        <Route  path="/tests" element={<CreateInterviewPage/>}/>

        <Route  path="/tests/:id" element={<InterviewDetail/>}/>

        <Route  path="/tests/:id/session/:sessionId" element={<Session/>}/>

        <Route path="/preparations" element={<Preparations/>}/>

        <Route path="/preparations/:id" element={<PreparationSession/>}/>

        <Route path="/analyser" element={<ResumeAnalyzerPage/>}/>

        <Route path="/analyser/:id" element={<ResumeFeedbackPage/>}/>

      </Routes>
    </div>
  );
}

export default App;
