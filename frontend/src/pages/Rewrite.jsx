import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { SkeletonTextPage } from "../components/LoadingSkeleton";
import FormattedReport from "../components/FormattedReport";

export default function Rewrite() {
  const [searchParams] = useSearchParams();
  const initialResumeId = searchParams.get("resume_id") || "";
  const initialJobId = searchParams.get("job_id") || "";

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId);
  const [targetJobId, setTargetJobId] = useState(initialJobId);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [rewrittenResume, setRewrittenResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    const fetchRewrittenResume = async () => {
      if (!initialResumeId || !initialJobId) return;

      setLoading(true);
      try {
        const response = await api.get(`resumes/${initialResumeId}/rewrite/${initialJobId}/`);
        setRewrittenResume(response.data.rewritten_resume);
      } catch (err) {
        console.error(err);
        setError("Failed to generate rewritten resume.");
      } finally {
        setLoading(false);
      }
    };

    fetchRewrittenResume();
  }, [initialResumeId, initialJobId]);

  const handleRewrite = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let activeJobId = targetJobId;
      if (!activeJobId) {
        if (!jobTitle || !jobDescription) {
          setError("Please specify job title and description.");
          setLoading(false);
          return;
        }
        const jobRes = await api.post("resumes/job-description/", {
          title: jobTitle,
          description: jobDescription,
        });
        activeJobId = jobRes.data.data.id;
        setTargetJobId(activeJobId);
      }

      const response = await api.get(`resumes/${selectedResumeId}/rewrite/${activeJobId}/`);
      setRewrittenResume(response.data.rewritten_resume);
    } catch (err) {
      console.error(err);
      setError("Failed to generate rewritten resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-sans text-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            AI Content Optimization
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume AI Rewrite</h1>
          <p className="text-xs text-slate-500 font-medium">Tailor and rewrite bullet points to align with job description keywords.</p>
        </div>

        {rewrittenResume && (
          <button
            onClick={handleCopy}
            className={copied ? "saas-button-emerald text-xs py-1.5 px-3" : "saas-button-secondary text-xs py-1.5 px-3"}
          >
            {copied ? "Copied ✓" : "Copy Optimized Version"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {!initialJobId && (
        <form onSubmit={handleRewrite} className="saas-card p-6 space-y-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Select Resume</label>
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
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Target Job Description</label>
            <textarea
              rows={4}
              placeholder="Paste job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="saas-input w-full leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="saas-button-primary w-full py-2.5 text-xs font-semibold"
          >
            {loading ? "Optimizing Resume Content..." : "Run Resume Rewrite"}
          </button>
        </form>
      )}

      {loading ? (
        <SkeletonTextPage />
      ) : rewrittenResume ? (
        <div className="saas-card p-6 space-y-4 border border-slate-200/80 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Optimized Resume & Rationale</span>
            <span className="saas-badge saas-badge-teal">Original vs Improved</span>
          </div>
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
            <FormattedReport content={rewrittenResume} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
