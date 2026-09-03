import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UploadResume() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(""); // Automatically hide validation error upon file selection
        if (!title) setTitle(selectedFile.name.replace(/\.pdf$/i, ""));
      } else {
        setFile(null);
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a resume file first.");
      return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title || file.name);
    formData.append("resume_file", file);

    try {
      await api.post("resumes/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/resumes");
    } catch (err) {
      console.error(err);
      setError("Failed to upload resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 font-sans text-slate-800">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md">
              ✨ Free AI Resume Compatibility Screener
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug">
              Is your resume <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                ATS Compatible & Optimized?
              </span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 leading-relaxed max-w-xl font-medium">
              Upload your PDF resume for instant ATS checking, section verification, and AI feedback to rank at the top of recruiter searches.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Dotted Upload Card */}
          <form onSubmit={handleUpload} className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Resume Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer Resume"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div className="text-center py-7 space-y-3 border-2 border-dashed border-teal-300 rounded-2xl bg-teal-50/20 p-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center mx-auto font-bold text-xl shadow-md shadow-teal-500/20">
                📄
              </div>
              <div>
                <p className="text-xs text-slate-900 font-bold">
                  Drop your PDF resume here or choose a file
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">PDF format only. Maximum size 5MB.</p>
              </div>

              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 cursor-pointer pt-2"
              />
            </div>

            {/* Selected File Confirmation Badge */}
            {file && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span>📄</span>
                  <span className="truncate">{file.name}</span>
                  <span className="text-[11px] text-teal-600 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <span className="text-teal-600 font-bold text-xs flex-shrink-0">✓ File Selected</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">🔒 Encrypted & Private</span>
              <button
                type="submit"
                disabled={loading}
                className="saas-button-primary text-xs py-2.5 px-6"
              >
                {loading ? "Analyzing PDF..." : "Upload & Evaluate Resume"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side Showcase Card */}
        <div className="lg:col-span-5">
          <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 lg:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs text-slate-900">ATS Check Matrix</span>
              <span className="saas-badge saas-badge-teal">92 / 100</span>
            </div>
            <div className="space-y-3.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span>ATS Section Parse Rate</span>
                <span className="text-teal-600 font-bold">✓ 100% Passed</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span>Contact Details Found</span>
                <span className="text-teal-600 font-bold">✓ Email & Phone</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span>Keyword Density</span>
                <span className="text-amber-600 font-bold">⚠️ 2 Missing Skills</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-blue-600 h-2.5 rounded-full w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}