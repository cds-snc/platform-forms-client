export const ParagraphIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    fill="none"
  >
    {title && <title>{title}</title>}
    <path d="M4 19v-2h10v2Zm0-4v-2h16v2Zm0-4V9h16v2Zm0-4V5h16v2Z" fill="#5F6368" />
  </svg>
);
