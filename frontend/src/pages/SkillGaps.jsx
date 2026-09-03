import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import FormattedReport from "../components/FormattedReport";

export default function SkillGaps() {
  const [searchParams] = useSearchParams();
  const initialResumeId = searchParams.get("resume_id") || "";

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [matchData, setMatchData] = useState(null);
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

  const handleAnalyzeGaps = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError("Please select a resume.");
      return;
    }
    if (!jobTitle.trim() || !jobDescription.trim()) {
      setError("Please specify job title and paste job description.");
      return;
    }

    setError("");
    setAnalyzing(true);
    setMatchData(null);

    try {
      const jobResponse = await api.post("resumes/job-description/", {
        title: jobTitle,
        description: jobDescription,
      });
      const savedJobId = jobResponse.data.data.id;

      const matchResponse = await api.get(`resumes/${selectedResumeId}/match/${savedJobId}/`);
      setMatchData(matchResponse.data.match);
    } catch (err) {
      console.error(err);
      setError("Skill gap analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-sans text-slate-800">
      <div className="border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            Skill Gap Matrix
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Skill Gap Analysis</h1>
          <p className="text-xs text-slate-500 font-medium">Identify missing technical skills and qualifications compared against target job requirements.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleAnalyzeGaps} className="saas-card p-6 space-y-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Select Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="saas-input w-full font-semibold cursor-pointer"
              required
            >
              <option value="">-- Select Resume --</option>
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
              placeholder="e.g. Full Stack Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="saas-input w-full"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Description & Skills</label>
          <textarea
            rows={5}
            placeholder="Paste job description..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="saas-input w-full leading-relaxed"
            required
          />
        </div>

        <button
          type="submit"
          disabled={analyzing}
          className="saas-button-emerald w-full py-2.5 text-xs font-semibold"
        >
          {analyzing ? "Analyzing Skill Gaps..." : "Analyze Skill Gaps"}
        </button>
      </form>

      {matchData && (
        <div className="saas-card p-6 space-y-4 border border-slate-200/80 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Skill Gap Evaluation</span>
            <span className="saas-badge saas-badge-amber">Analysis Complete</span>
          </div>

          <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
            <FormattedReport content={matchData} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Link to="/rewrite" className="saas-button-primary text-xs py-2 px-4">
              Rewrite Resume for Missing Skills
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
