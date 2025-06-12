export const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-300">
    <div
      className="h-full bg-indigo-500 transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);
