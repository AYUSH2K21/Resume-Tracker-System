import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { SkeletonCard } from "../components/LoadingSkeleton";

export default function ATS() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlResumeId = searchParams.get("resume_id");
  
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(urlResumeId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumesAndATS = async () => {
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
          const atsRes = await api.get(`resumes/${activeId}/ats/`);
          setResult(atsRes.data);
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to run ATS evaluation check.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumesAndATS();
  }, [urlResumeId]);

  const handleSelectResume = async (e) => {
    const newId = e.target.value;
    setSelectedResumeId(newId);
    if (!newId) return;

    setSearchParams({ resume_id: newId });
    setEvaluating(true);
    setError("");
    try {
      const response = await api.get(`resumes/${newId}/ats/`);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to run ATS evaluation check.");
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ATS Evaluation</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 font-sans text-slate-800 py-16 saas-card p-8 border border-slate-200/80 rounded-3xl shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto text-xl font-bold">
          📄
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Resumes Found</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please upload a PDF resume first to perform an ATS evaluation check.
        </p>
        <Link to="/upload" className="saas-button-primary text-xs inline-flex py-2 px-4">
          + Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-sans text-slate-800">
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            ATS Compatibility Screener
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">ATS Evaluation Check</h1>
          <p className="text-xs text-slate-500 font-medium">Select any uploaded resume to evaluate its ATS compatibility score.</p>
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
          Evaluating ATS compatibility score...
        </div>
      )}

      {result && !evaluating && (
        <>
          {/* Main Score & Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 saas-card p-6 text-center space-y-3 flex flex-col justify-center items-center border-l-4 border-l-teal-500">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall ATS Score</span>
              <div className="text-5xl font-black text-slate-900 my-1">{result.score}/100</div>
              <span className="saas-badge saas-badge-teal text-xs">
                {result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : "Needs Optimization"}
              </span>
              {result.overall_explanation && (
                <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100 font-medium">
                  {result.overall_explanation}
                </p>
              )}
            </div>

            <div className="md:col-span-8 saas-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                ATS Component Score Breakdown
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Keyword Match</span>
                    <span className="text-teal-600 font-extrabold">{result.keyword_score ?? 80}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {result.keyword_explanation || "Evaluation of keyword density across technical domain terms."}
                  </p>
                </div>

                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Skills Match</span>
                    <span className="text-teal-600 font-extrabold">{result.skills_score ?? 75}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {result.skills_explanation || "Relevance and density of core technical and professional skills."}
                  </p>
                </div>

                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Experience Match</span>
                    <span className="text-teal-600 font-extrabold">{result.experience_score ?? 85}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {result.experience_explanation || "Detection of work history structure and action-oriented achievements."}
                  </p>
                </div>

                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Education Match</span>
                    <span className="text-teal-600 font-extrabold">{result.education_score ?? 90}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {result.education_explanation || "Verification of academic degree credentials and institutions."}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700">Section Completeness</span>
                    <span className="text-teal-600 font-extrabold">{result.section_completeness_score ?? 85}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {result.section_completeness_explanation || "Presence of standard ATS sections (Summary, Skills, Experience, Education)."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Resume Sections */}
          <div className="saas-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              Section Formatting & Verification
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              {result.found_sections?.map((sec) => (
                <div key={sec} className="saas-card-subtle p-2 text-slate-800 font-semibold capitalize flex items-center justify-between">
                  <span>{sec}</span>
                  <span className="saas-badge saas-badge-teal text-[10px]">Found</span>
                </div>
              ))}
              {result.missing_sections?.map((sec) => (
                <div key={sec} className="saas-card-subtle p-2 text-slate-400 line-through capitalize flex items-center justify-between">
                  <span>{sec}</span>
                  <span className="saas-badge saas-badge-red text-[10px]">Missing</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="saas-card p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900">Matched Skills</h3>
                <span className="text-xs text-slate-400 font-medium">{result.found_skills?.length || 0} Found</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.found_skills?.map((skill) => (
                  <span key={skill} className="saas-badge saas-badge-teal capitalize text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="saas-card p-5 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900">Missing Skills</h3>
                <span className="text-xs text-slate-400 font-medium">{result.missing_skills?.length || 0} Missing</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.missing_skills?.map((skill) => (
                  <span key={skill} className="saas-badge saas-badge-slate capitalize text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}