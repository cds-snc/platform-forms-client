export const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-300">
    <progress
      className="h-full bg-indigo-500 transition-all duration-300"
      style={{ width: `${progress}%` }}
      max="100"
      value={progress}
    />
    <div className="sr-only" aria-live="polite">{`${progress}%`}</div>
  </div>
);
