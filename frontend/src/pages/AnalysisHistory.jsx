import { useEffect, useState } from "react";
import api from "../services/api";
import { SkeletonRow } from "../components/LoadingSkeleton";
import FormattedReport from "../components/FormattedReport";

export default function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("resumes/history/");
        setHistory(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analysis history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5 font-sans text-slate-800 max-w-6xl mx-auto">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analysis History</h1>
        </div>
        <div className="saas-card p-4 space-y-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans text-slate-800 max-w-6xl mx-auto">
      <div className="border-b border-slate-200/80 pb-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-100 text-teal-700 rounded-md mb-1">
            Audit Logs
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analysis History</h1>
          <p className="text-xs text-slate-500 font-medium">Review saved ATS evaluations, AI feedback reports, and skill assessments.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 saas-card p-5 space-y-3 shadow-md">
          <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider">
            Saved Analysis Log ({history.length})
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-8">
              No saved analysis history found. Run an ATS check or AI review to record logs.
            </p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedEntry(item)}
                  className={`p-3 saas-card-subtle cursor-pointer transition-colors flex justify-between items-center gap-3 ${
                    selectedEntry?.id === item.id ? "border-teal-500 bg-teal-50/50" : ""
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="saas-badge saas-badge-teal capitalize text-[10px]">
                        {item.analysis_type.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.resume_title || `Resume #${item.resume}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button className="saas-button-secondary text-[11px] py-1 px-2.5">
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 saas-card p-6 space-y-4 min-h-[300px] shadow-xl border border-slate-200/80 rounded-3xl">
          <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider">
            Analysis Output Details
          </h3>

          {!selectedEntry ? (
            <div className="text-center py-16 text-xs text-slate-400 font-medium">
              Select an entry from the history log to inspect detailed results.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900">
                  Type: <span className="text-teal-700 font-semibold">{selectedEntry.analysis_type}</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(selectedEntry.created_at).toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 max-h-[420px] overflow-y-auto custom-scrollbar">
                <FormattedReport content={selectedEntry.result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
