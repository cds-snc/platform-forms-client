export const PersonIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="34"
    height="34"
    className={className}
    viewBox="0 0 34 34"
    fill="none"
    focusable="false"
    aria-hidden={title ? false : true}
  >
    {title && <title>{title}</title>}
    <circle cx="17" cy="17" r="15" strokeWidth="2" />
    <circle cx="17" cy="13.5" r="4.5" strokeWidth="2" />
    <g clipPath="url(#avatar-clip)">
      <path d="M5 28C5 21 11 21 17 21C23 21 29 21 29 28" strokeWidth="2" strokeLinecap="round" />
    </g>
    <defs>
      <clipPath id="avatar-clip">
        <circle cx="17" cy="17" r="15" />
      </clipPath>
    </defs>
  </svg>
);
