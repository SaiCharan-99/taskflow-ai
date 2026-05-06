export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div
    className={`bg-slate-800 rounded-xl border border-slate-700 p-4 animate-pulse ${className}`}
  >
    <div className="flex justify-between">
      <div className="h-4 w-16 bg-slate-700 rounded" />
      <div className="h-4 w-12 bg-slate-700 rounded" />
    </div>
    <div className="h-4 w-3/4 bg-slate-700 rounded mt-3" />
    <div className="h-3 w-1/2 bg-slate-700 rounded mt-2" />
    <div className="flex justify-between items-center mt-4">
      <div className="w-6 h-6 rounded-full bg-slate-700" />
      <div className="h-3 w-16 bg-slate-700 rounded" />
    </div>
  </div>
);
