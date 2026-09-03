import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("auth/profile/");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to load user profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  const getPageTitle = (path) => {
    const titleMap = {
      "/dashboard": "Executive Dashboard",
      "/resumes": "My Resumes",
      "/upload": "Upload Resume",
      "/builder": "Resume Builder",
      "/rewrite": "Resume AI Rewrite",
      "/ats": "ATS Analysis Check",
      "/analysis": "AI Resume Review",
      "/match": "Job Match Studio",
      "/unified-analysis": "Unified Intelligence Suite",
      "/applications": "Applications Tracker",
      "/skill-gaps": "Skill Gap Analysis",
      "/interview": "Interview Preparation Kit",
      "/cover-letter": "Cover Letter Generator",
      "/history": "Analysis History",
    };
    return titleMap[path] || "ResumeTracker";
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 h-14 px-6 flex items-center justify-between text-slate-800 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-xl border border-slate-200 bg-slate-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Workspace /</span>
          <h1 className="font-bold text-xs text-slate-900 tracking-tight">{getPageTitle(location.pathname)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-800">{user.username}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="saas-button-secondary text-xs py-1.5 px-3 h-8 text-slate-700 font-semibold"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
