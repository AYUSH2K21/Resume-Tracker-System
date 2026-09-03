export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="space-y-2 flex-1 max-w-sm">
        <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
        <div className="h-2.5 bg-slate-200/60 rounded w-1/2"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded w-16"></div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse saas-card p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-3.5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-5 bg-slate-200 rounded w-12"></div>
      </div>
      <div className="h-8 bg-slate-200/60 rounded w-1/2"></div>
      <div className="h-2.5 bg-slate-200/40 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTextPage() {
  return (
    <div className="animate-pulse space-y-4 saas-card p-6">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-2.5">
        <div className="h-3 bg-slate-200/70 rounded w-full"></div>
        <div className="h-3 bg-slate-200/70 rounded w-11/12"></div>
        <div className="h-3 bg-slate-200/70 rounded w-4/5"></div>
        <div className="h-3 bg-slate-200/70 rounded w-9/12"></div>
      </div>
    </div>
  );
}
