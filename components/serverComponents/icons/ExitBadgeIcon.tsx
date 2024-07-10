export const ExitBadgeIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <g clipPath="url(#a)">
      <path
        fill="#1E293B"
        d="M21 0H3a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3Z"
      />
      <path
        fill="#EEF2FF"
        d="M5 24c-.55 0-1.02-.196-1.413-.587A1.926 1.926 0 0 1 3 22v-4h2v4h14V8H5v4H3V8c0-.55.196-1.02.587-1.412A1.926 1.926 0 0 1 5 6h14c.55 0 1.02.196 1.413.588.391.391.587.862.587 1.412v14c0 .55-.196 1.02-.587 1.413A1.926 1.926 0 0 1 19 24H5Zm5.5-4-1.4-1.45L11.65 16H3v-2h8.65L9.1 11.45 10.5 10l5 5-5 5Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v28H0z" />
      </clipPath>
    </defs>
  </svg>
);
