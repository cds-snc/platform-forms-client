export const EssentialIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="28"
    fill="none"
    className={className}
    viewBox="0 0 24 28"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <rect width="24" height="28" rx="3" fill="#1E293B" />
    <path
      d="M7.87544 10.087C7.75197 8.3913 8.43103 5 12.135 5C13.524 5.13458 16.2278 6.34037 15.9315 10.087M5.83908 23H18.1609C19.1766 23 20 22.124 20 21.0435V11.8478C20 10.7673 19.1766 9.8913 18.1609 9.8913H5.83908C4.82338 9.8913 4 10.7673 4 11.8478V21.0435C4 22.124 4.82338 23 5.83908 23Z"
      stroke="#EEF2FF"
      strokeWidth="2.5"
    />
  </svg>
);
