export const ExternalLinkIcon2 = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden={title ? false : true}
  >
    {title && <title>{title}</title>}
    <path d="M14 5h5v5" />
    <path d="M10 14 19 5" />
    <path d="M19 14v5H5V5h5" />
  </svg>
);
