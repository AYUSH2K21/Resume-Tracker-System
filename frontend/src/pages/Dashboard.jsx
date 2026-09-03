import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes, profileRes] = await Promise.all([
          api.get("resumes/dashboard-stats/"),
          api.get("resumes/applications/"),
          api.get("auth/profile/").catch(() => null),
        ]);
        setStats(statsRes.data);
        setApplications(appsRes.data);
        if (profileRes?.data?.username) {
          setUsername(profileRes.data.username);
        }
      } catch (error) {
        console.error("Error loading dashboard statistics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 bg-slate-200 rounded-xl w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const totalApplications = applications.length;
  const interviewing = applications.filter(
    (a) => a.status === "INTERVIEWING" || a.status === "PHONE_SCREEN"
  ).length;

  const totalAnalyses = stats?.total_analyses || 0;
  const avgAtsScore = stats?.average_ats_score || 0;
  const scoreHistory = stats?.ats_score_history || [];

  const statusBadges = {
    APPLIED: "saas-badge-slate",
    PHONE_SCREEN: "saas-badge-amber",
    INTERVIEWING: "saas-badge-amber",
    OFFER: "saas-badge-teal",
    REJECTED: "saas-badge-red",
    ACCEPTED: "saas-badge-teal",
  };

  const renderChart = () => {
    if (scoreHistory.length === 0) {
      return (
        <div className="h-36 flex items-center justify-center text-slate-400 text-xs font-medium">
          No ATS score evaluation history logged yet.
        </div>
      );
    }

    const width = 500;
    const height = 140;
    const paddingX = 30;
    const paddingY = 20;

    const points = scoreHistory.map((item, index) => {
      const x =
        scoreHistory.length > 1
          ? paddingX + (index / (scoreHistory.length - 1)) * (width - paddingX * 2)
          : width / 2;
      const y = height - paddingY - (item.score / 100) * (height - paddingY * 2);
      return { x, y, score: item.score, date: item.date };
    });

    const pathD =
      points.length > 0
        ? `M ${points[0].x} ${points[0].y} ` +
          points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
        : "";

    const areaD =
      points.length > 0
        ? `M ${points[0].x} ${height - paddingY} ` +
          points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
          ` L ${points[points.length - 1].x} ${height - paddingY} Z`
        : "";

    return (
      <div className="relative w-full overflow-x-auto pt-2">
        <svg className="w-full min-w-[380px] h-36" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="loginTealArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="loginTealStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" />

          {areaD && <path d={areaD} fill="url(#loginTealArea)" />}

          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#loginTealStroke)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#ffffff"
                stroke="#0d9488"
                strokeWidth="2.5"
                className="group-hover:r-6 group-hover:fill-teal-600 transition-all shadow-md"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="text-[10px] font-bold fill-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {p.score}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 max-w-6xl mx-auto">
      {/* Hero Section matching Login/Register text gradients */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-2">
            Workspace Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">{username || "Candidate"}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Overview of your ATS resume evaluation and job search applications.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/skill-gaps" className="saas-button-secondary">
            Skill Gaps
          </Link>
          <Link to="/upload" className="saas-button-primary">
            + Upload Resume
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid matching Login/Register styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="saas-card p-5 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Applications</span>
          <div className="flex items-baseline gap-2.5 pt-2">
            <p className="text-3xl font-extrabold text-slate-900">{totalApplications}</p>
            {interviewing > 0 && <span className="saas-badge saas-badge-amber text-xs">{interviewing} Active</span>}
          </div>
        </div>

        <div className="saas-card p-5 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Reviews Completed</span>
          <p className="text-3xl font-extrabold text-slate-900 pt-2">{totalAnalyses}</p>
        </div>

        <div className="saas-card p-5 relative overflow-hidden border-l-4 border-l-teal-500">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average ATS Score</span>
          <p className="text-3xl font-extrabold text-teal-600 pt-2">{avgAtsScore}%</p>
        </div>

        <div className="saas-card p-5 relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Resume</span>
          <p className="text-sm font-bold text-slate-800 truncate pt-3">
            {stats?.recent_resume ? stats.recent_resume.title : "No resume uploaded"}
          </p>
        </div>
      </div>

      {/* Main Grid: Trend Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 saas-card p-6 space-y-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">ATS Score History Trend</h3>
            <span className="saas-badge saas-badge-teal">{scoreHistory.length} Scans</span>
          </div>
          {renderChart()}
        </div>

        <div className="lg:col-span-4 saas-card p-6 space-y-2">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity Stream</h3>
          </div>
          {stats?.recent_activity?.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No recent evaluations.</p>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar mt-2">
              {stats?.recent_activity?.map((act) => (
                <div key={act.id} className="p-3 saas-card-subtle flex justify-between items-start gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold text-slate-800 capitalize truncate">{act.type}</p>
                    <p className="text-[11px] text-slate-500 truncate">{act.resume_title}</p>
                  </div>
                  <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">{act.created_at}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Recent Application Pipeline</h3>
          <Link to="/applications" className="text-xs text-teal-600 font-bold hover:text-teal-700 transition-colors">
            View All →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 space-y-3">
            <p>No job applications logged yet.</p>
            <Link to="/applications" className="saas-button-secondary text-xs">
              + Log Application
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold text-[10px] tracking-wider uppercase bg-slate-50">
                  <th className="py-3 px-4 rounded-tl-xl">Company</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Status Stage</th>
                  <th className="py-3 px-4 text-right rounded-tr-xl">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{app.company}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{app.job_title}</td>
                    <td className="py-3.5 px-4">
                      <span className={`saas-badge ${statusBadges[app.status] || "saas-badge-slate"}`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {app.applied_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}