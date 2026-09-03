import { useEffect, useState } from "react";
import api from "../services/api";
import { SkeletonRow } from "../components/LoadingSkeleton";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");

  const fetchApplications = async () => {
    try {
      const response = await api.get("resumes/applications/");
      setApplications(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load applications.");
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await api.get("resumes/");
      setResumes(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchApplications(), fetchResumes()]);
      setLoading(false);
    };
    init();
  }, []);

  const resetForm = () => {
    setCompany("");
    setJobTitle("");
    setStatus("APPLIED");
    setJobUrl("");
    setNotes("");
    setResumeId("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      company,
      job_title: jobTitle,
      status,
      job_url: jobUrl || null,
      notes,
      resume: resumeId ? parseInt(resumeId) : null,
    };

    try {
      if (editingId) {
        const res = await api.put(`resumes/applications/${editingId}/`, payload);
        setApplications((prev) =>
          prev.map((app) => (app.id === editingId ? res.data : app))
        );
      } else {
        const res = await api.post("resumes/applications/", payload);
        setApplications((prev) => [res.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save application.");
    }
  };

  const startEdit = (app) => {
    setEditingId(app.id);
    setCompany(app.company);
    setJobTitle(app.job_title);
    setStatus(app.status);
    setJobUrl(app.job_url || "");
    setNotes(app.notes || "");
    setResumeId(app.resume ? app.resume.toString() : "");
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application log entry?")) return;
    try {
      await api.delete(`resumes/applications/${id}/`);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete application.");
    }
  };

  const statusBadges = {
    APPLIED: "saas-badge saas-badge-slate",
    PHONE_SCREEN: "saas-badge saas-badge-amber",
    INTERVIEWING: "saas-badge saas-badge-amber",
    OFFER: "saas-badge saas-badge-teal",
    REJECTED: "saas-badge saas-badge-red",
    ACCEPTED: "saas-badge saas-badge-teal",
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Applications Tracker</h1>
        </div>
        <div className="saas-card p-5">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans text-slate-800 max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Applications Tracker</h1>
          <p className="text-xs text-slate-500 font-medium">Log and track job application statuses across hiring pipelines.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="saas-button-emerald text-xs py-1.5 px-3.5"
          >
            + Add Application
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="saas-card p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
            {editingId ? "Edit Application Details" : "Log New Job Application"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Stripe, Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="saas-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="saas-input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stage / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="saas-input w-full font-semibold cursor-pointer"
              >
                <option value="APPLIED">Applied</option>
                <option value="PHONE_SCREEN">Phone Screen</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFER">Offer Received</option>
                <option value="REJECTED">Rejected</option>
                <option value="ACCEPTED">Offer Accepted</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Submitted Resume</label>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="saas-input w-full font-semibold cursor-pointer"
              >
                <option value="">-- Unlinked --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Posting URL</label>
              <input
                type="url"
                placeholder="https://company.com/careers/job"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="saas-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recruiter Notes / Details</label>
            <textarea
              rows={3}
              placeholder="Recruiter contact info, interview rounds scheduled, compensation range..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="saas-input w-full leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="saas-button-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="saas-button-emerald text-xs py-1.5 px-4 font-bold"
            >
              Save Application Log
            </button>
          </div>
        </form>
      )}

      <div className="saas-card overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-sm text-slate-500 mx-auto">
              💼
            </div>
            <p className="text-xs font-bold text-slate-900">No Applications Logged</p>
            <p className="text-xs text-slate-500 font-medium">Click "+ Add Application" to start tracking your job search pipeline.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold bg-slate-50 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Company</th>
                  <th className="py-2.5 px-3.5">Role Title</th>
                  <th className="py-2.5 px-3.5">Status Stage</th>
                  <th className="py-2.5 px-3.5">Linked Resume</th>
                  <th className="py-2.5 px-3.5">Date Applied</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {app.job_url ? (
                        <a href={app.job_url} target="_blank" rel="noreferrer" className="hover:underline text-emerald-700">
                          {app.company} 🔗
                        </a>
                      ) : (
                        app.company
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-medium">{app.job_title}</td>
                    <td className="py-2.5 px-3.5">
                      <span className={statusBadges[app.status] || "saas-badge saas-badge-slate"}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-medium">
                      {app.resume_title || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">{app.applied_date}</td>
                    <td className="py-2.5 px-3.5 text-right space-x-2">
                      <button
                        onClick={() => startEdit(app)}
                        className="text-emerald-700 hover:underline font-bold text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-400 hover:text-red-600 font-medium text-xs"
                      >
                        Delete
                      </button>
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
