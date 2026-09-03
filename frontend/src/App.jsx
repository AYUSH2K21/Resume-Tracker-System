import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import ResumeList from "./pages/ResumeList";
import ATS from "./pages/ATS";
import AIAnalysis from "./pages/AIAnalysis";
import JobMatch from "./pages/JobMatch";
import CoverLetter from "./pages/CoverLetter";
import InterviewQuestions from "./pages/InterviewQuestions";
import Rewrite from "./pages/Rewrite";
import Applications from "./pages/Applications";
import ResumeBuilder from "./pages/ResumeBuilder";
import SkillGaps from "./pages/SkillGaps";
import AnalysisHistory from "./pages/AnalysisHistory";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layouts/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <UploadResume />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute>
            <Layout>
              <ResumeList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats"
        element={
          <ProtectedRoute>
            <Layout>
              <ATS />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <Layout>
              <AIAnalysis />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/match"
        element={
          <ProtectedRoute>
            <Layout>
              <JobMatch />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/skill-gaps"
        element={
          <ProtectedRoute>
            <Layout>
              <SkillGaps />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <AnalysisHistory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cover-letter"
        element={
          <ProtectedRoute>
            <Layout>
              <CoverLetter />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewQuestions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rewrite"
        element={
          <ProtectedRoute>
            <Layout>
              <Rewrite />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Layout>
              <Applications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder"
        element={
          <ProtectedRoute>
            <Layout>
              <ResumeBuilder />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;