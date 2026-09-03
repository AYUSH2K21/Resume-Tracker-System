import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { SkeletonTextPage } from "../components/LoadingSkeleton";
import FormattedReport from "../components/FormattedReport";

export default function CoverLetter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlResumeId = searchParams.get("resume_id");
  const urlJobId = searchParams.get("job_id");

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(urlResumeId || "");

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const resumesRes = await api.get("resumes/");
        const resumeList = resumesRes.data || [];
        setResumes(resumeList);

        let activeResume = urlResumeId;
        if (!activeResume && resumeList.length > 0) {
          activeResume = resumeList[0].id.toString();
          setSelectedResumeId(activeResume);
        }

        if (urlResumeId && urlJobId) {
          const res = await api.get(`resumes/${urlResumeId}/cover-letter/${urlJobId}/`);
          setCoverLetter(res.data.cover_letter);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to initialize cover letter generator.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlResumeId, urlJobId]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }

    setGenerating(true);
    setError("");
    try {
      let jobId = urlJobId;
      if (!jobId) {
        const jdRes = await api.post("resumes/job-description/", {
          title: "General Role Alignment",
          description: "General Professional Role requiring strong technical expertise, communication skills, and problem solving."
        });
        jobId = jdRes.data.data.id;
      }

      setSearchParams({ resume_id: selectedResumeId, job_id: jobId });
      const res = await api.get(`resumes/${selectedResumeId}/cover-letter/${jobId}/`);
      setCoverLetter(res.data.cover_letter);
    } catch (err) {
      console.error(err);
      setError("Failed to generate cover letter.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cover Letter Generator</h1>
        </div>
        <SkeletonTextPage />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-3 font-sans text-slate-800 py-12 saas-card p-6 border border-slate-200/80 rounded-3xl shadow-xl">
        <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto text-base font-bold">
          ✉️
        </div>
        <h2 className="text-sm font-bold text-slate-900">No Resumes Uploaded</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Upload a resume first to generate custom, AI-tailored cover letters.
        </p>
        <Link to="/upload" className="saas-button-emerald text-xs inline-flex py-1.5 px-4">
          + Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-sans text-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            Application Generator
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cover Letter Generator</h1>
          <p className="text-xs text-slate-500 font-medium">Generate professional, one-page tailored cover letters in seconds.</p>
        </div>
        
        {coverLetter && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={copied ? "saas-button-emerald text-xs py-1.5 px-3" : "saas-button-secondary text-xs py-1.5 px-3"}
            >
              {copied ? "Copied ✓" : "Copy Letter"}
            </button>
          </div>
        )}
      </div>

      {/* Generator Control Card */}
      <form onSubmit={handleGenerate} className="saas-card p-6 space-y-3 shadow-md">
        <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">
          Select Source Resume
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-8">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="saas-input w-full text-xs font-semibold"
              required
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              disabled={generating}
              className="saas-button-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {generating ? "Generating..." : "Generate Cover Letter"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {generating && (
        <div className="saas-card p-8 text-center text-xs text-teal-600 font-bold animate-pulse">
          Crafting personalized cover letter with AI...
        </div>
      )}

      {coverLetter && !generating && (
        <div className="saas-card p-6 space-y-4 border border-slate-200/80 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Document Preview</span>
            <span className="saas-badge saas-badge-teal text-[11px]">Generated</span>
          </div>
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
            <FormattedReport content={coverLetter} />
          </div>
        </div>
      )}
    </div>
  );
}