import { Link } from "react-router-dom";

export default function ResumeCard({ resume, onDelete }) {
  const formattedDate = new Date(resume.uploaded_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/").replace(/\/api\/?$/, "");
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="saas-card p-5 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-2.5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-1 rounded-md bg-teal-100 border border-teal-200 text-teal-700 text-[11px] font-mono font-bold flex-shrink-0">
              PDF
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-xs truncate">{resume.title}</h3>
              <p className="text-[11px] text-slate-400">Uploaded {formattedDate}</p>
            </div>
          </div>
          <button
            onClick={() => onDelete(resume.id)}
            className="text-slate-400 hover:text-red-600 p-1 transition-colors text-xs cursor-pointer"
            title="Delete Resume"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2.5 border-t border-slate-100">
        <a
          href={getFileUrl(resume.resume_file)}
          target="_blank"
          rel="noreferrer"
          className="saas-button-secondary w-full py-1.5 text-xs text-center justify-center font-bold"
        >
          View Original PDF ↗
        </a>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/ats?resume_id=${resume.id}`}
            className="saas-button-secondary py-1.5 px-2 text-[11px] text-center justify-center"
          >
            ATS Check
          </Link>
          <Link
            to={`/analysis?resume_id=${resume.id}`}
            className="saas-button-primary py-1.5 px-2 text-[11px] text-center justify-center"
          >
            AI Review
          </Link>
        </div>

        <Link
          to={`/match?resume_id=${resume.id}`}
          className="saas-button-emerald w-full py-1.5 text-xs text-center justify-center font-semibold"
        >
          Match with Job →
        </Link>
      </div>
    </div>
  );
}
