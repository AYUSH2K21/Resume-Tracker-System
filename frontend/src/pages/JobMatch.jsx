import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import FormattedReport from "../components/FormattedReport";

export default function JobMatch() {
  const [searchParams] = useSearchParams();
  const initialResumeId = searchParams.get("resume_id") || "";

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await api.get("resumes/");
        setResumes(response.data);
        if (response.data.length > 0 && !selectedResumeId) {
          setSelectedResumeId(response.data[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load resumes", err);
      }
    };
    fetchResumes();
  }, [selectedResumeId]);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }
    if (!jobTitle || !jobDescription) {
      setError("Please fill out all job fields.");
      return;
    }

    setError("");
    setMatching(true);
    setResult(null);

    try {
      const jobResponse = await api.post("resumes/job-description/", {
        title: jobTitle,
        description: jobDescription,
      });
      const savedJobId = jobResponse.data.data.id;
      setJobId(savedJobId);

      const matchResponse = await api.get(`resumes/${selectedResumeId}/match/${savedJobId}/`);
      setResult(matchResponse.data.match);
    } catch (err) {
      console.error(err);
      setError("Match analysis failed.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-sans text-slate-800">
      <div className="border-b border-slate-200/80 pb-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
          Job Target Matcher
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Match Studio</h1>
        <p className="text-xs text-slate-500 font-medium">Compare your resume against target job description requirements.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleMatch} className="saas-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Target Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="saas-input w-full font-semibold cursor-pointer"
              required
            >
              <option value="">-- Choose Resume --</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Target Job Title</label>
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

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Description & Requirements</label>
          <textarea
            rows={5}
            placeholder="Paste job description text..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="saas-input w-full leading-relaxed"
            required
          />
        </div>

        <button
          type="submit"
          disabled={matching}
          className="saas-button-primary w-full py-2.5 text-xs font-semibold"
        >
          {matching ? "Analyzing Match..." : "Run Job Match"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="saas-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-xs font-bold text-slate-900">Recommended Actions</span>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/rewrite?resume_id=${selectedResumeId}&job_id=${jobId}`}
                className="saas-button-emerald text-xs py-1.5 px-3"
              >
                Rewrite Resume
              </Link>
              <Link
                to={`/cover-letter?resume_id=${selectedResumeId}&job_id=${jobId}`}
                className="saas-button-secondary text-xs py-1.5 px-3"
              >
                Cover Letter
              </Link>
              <Link
                to={`/interview?resume_id=${selectedResumeId}&job_id=${jobId}`}
                className="saas-button-secondary text-xs py-1.5 px-3"
              >
                Interview Prep
              </Link>
            </div>
          </div>

          {/* Match Analysis Output */}
          <div className="saas-card p-6 space-y-4 border border-slate-200/80 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Qualification Match Report</span>
              <span className="saas-badge saas-badge-teal">Comparison Ready</span>
            </div>
            <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
              <FormattedReport content={result} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}