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
import ScrollAnimation from "./components/ScrollAnimation";
import ProtectedWrapper from "./components/ProtectedWrapper";

function App() {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedWrapper>
              <DashBoard />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedWrapper>
              <JobsPage />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <ProtectedWrapper>
              <JobDetail />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/applicationtracker"
          element={
            <ProtectedWrapper>
              <ApplicationTracker />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/applicationtracker/:id"
          element={
            <ProtectedWrapper>
              <ApplicationDetail />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/tests"
          element={
            <ProtectedWrapper>
              <CreateInterviewPage />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/tests/:id"
          element={
            <ProtectedWrapper>
              <InterviewDetail />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/tests/:id/session/:sessionId"
          element={
            <ProtectedWrapper>
              <Session />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/preparations"
          element={
            <ProtectedWrapper>
              <Preparations />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/preparations/:id"
          element={
            <ProtectedWrapper>
              <PreparationSession />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/analyser"
          element={
            <ProtectedWrapper>
              <ResumeAnalyzerPage />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/analyser/:id"
          element={
            <ProtectedWrapper>
              <ResumeFeedbackPage />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/scroll"
          element={
            <ProtectedWrapper>
              <ScrollAnimation />
            </ProtectedWrapper>
          }
        />
      </Routes>
    </div>
  );
}

export default App;