const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const PublishedFormLink = ({
  label,
  href,
  copyLabel,
  openLabel,
  copied,
  copiedLabel,
  onCopy,
}: {
  label: string;
  href: string;
  copyLabel: string;
  openLabel: string;
  copied: boolean;
  copiedLabel: string;
  onCopy: (href: string) => void;
}) => {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 no-underline hover:underline focus:underline"
      >
        {label}
      </a>
      <div className="flex items-center gap-2">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={openLabel}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100 focus:bg-slate-100"
        >
          {openLabel}
        </a>
        <button
          type="button"
          onClick={() => onCopy(href)}
          aria-label={copyLabel}
          title={copyLabel}
          className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
        >
          <CopyIcon />
        </button>
      </div>
      <span className={`text-xs text-emerald-700 ${copied ? "visible" : "invisible"}`}>
        {copiedLabel}
      </span>
    </li>
  );
};
