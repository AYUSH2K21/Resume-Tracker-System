import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { SkeletonTextPage } from "../components/LoadingSkeleton";
import FormattedReport from "../components/FormattedReport";

export default function AIAnalysis() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlResumeId = searchParams.get("resume_id");

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(urlResumeId || "");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumesAndAI = async () => {
      setLoading(true);
      setError("");
      try {
        const resumesRes = await api.get("resumes/");
        const list = resumesRes.data || [];
        setResumes(list);

        let activeId = urlResumeId;
        if (!activeId && list.length > 0) {
          activeId = list[0].id.toString();
          setSelectedResumeId(activeId);
        }

        if (activeId) {
          const aiRes = await api.get(`resumes/${activeId}/ai/`);
          setAnalysis(aiRes.data.analysis);
        } else {
          setAnalysis("");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to run AI review analysis.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumesAndAI();
  }, [urlResumeId]);

  const handleSelectResume = async (e) => {
    const newId = e.target.value;
    setSelectedResumeId(newId);
    if (!newId) return;

    setSearchParams({ resume_id: newId });
    setEvaluating(true);
    setError("");
    try {
      const response = await api.get(`resumes/${newId}/ai/`);
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
      setError("Failed to run AI review analysis.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Resume Review</h1>
        </div>
        <SkeletonTextPage />
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-3 font-sans text-slate-800 py-12 saas-card p-6 border border-slate-200/80 rounded-3xl shadow-xl">
        <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto text-base font-bold">
          🤖
        </div>
        <h2 className="text-sm font-bold text-slate-900">No Resumes Uploaded</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Upload a resume to perform a deep AI review and generate strength & weakness reports.
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
            AI Evaluation Report
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Resume Review</h1>
          <p className="text-xs text-slate-500 font-medium">Select any uploaded resume to generate a full AI feedback report.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedResumeId}
            onChange={handleSelectResume}
            disabled={evaluating}
            className="saas-input text-xs font-semibold py-2 px-3 bg-white border-slate-300 w-full sm:w-64 cursor-pointer"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <Link to="/resumes" className="saas-button-secondary text-xs py-2 px-3 whitespace-nowrap">
            My Resumes
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {evaluating && (
        <div className="saas-card p-8 text-center text-xs text-teal-600 font-bold animate-pulse">
          Generating AI Review feedback report...
        </div>
      )}

      {analysis && !evaluating && (
        <div className="saas-card p-6 space-y-4 shadow-xl border border-slate-200/80 rounded-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>AI Feedback & Recommendations</span>
            <span className="saas-badge saas-badge-teal text-[11px]">Analysis Complete</span>
          </div>
          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
            <FormattedReport content={analysis} />
          </div>
        </div>
      )}
    </div>
  );
}