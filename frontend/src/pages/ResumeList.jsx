import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { SkeletonCard } from "../components/LoadingSkeleton";

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("resumes/");
        setResumes(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load resumes.");
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`resumes/${id}/delete/`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Resumes</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            Resume Library
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Resumes</h1>
          <p className="text-xs text-slate-500 font-medium">Manage uploaded PDF resumes and run AI evaluations.</p>
        </div>
        <Link to="/upload" className="saas-button-primary text-xs py-2 px-4">
          + Upload Resume
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="saas-card p-12 text-center space-y-3 max-w-md mx-auto my-8 border border-slate-200/80 rounded-3xl shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto text-xl font-bold">
            📁
          </div>
          <h3 className="text-base font-bold text-slate-900">No Resumes Uploaded Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Upload your first PDF resume to run ATS checks, AI reviews, and job matching.
          </p>
          <Link to="/upload" className="saas-button-primary text-xs inline-flex py-2 px-4">
            + Upload First Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((resume) => (
            <div key={resume.id} className="saas-card p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                    📄
                  </div>
                  <span className="saas-badge saas-badge-teal text-[11px]">PDF</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{resume.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/ats?resume_id=${resume.id}`}
                    className="saas-button-secondary text-xs py-1.5 text-center justify-center"
                  >
                    ATS Check
                  </Link>
                  <Link
                    to={`/analysis?resume_id=${resume.id}`}
                    className="saas-button-primary text-xs py-1.5 text-center justify-center"
                  >
                    AI Review
                  </Link>
                </div>
                
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <a
                    href={resume.resume_file}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Download Original ↗
                  </a>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="font-medium text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}