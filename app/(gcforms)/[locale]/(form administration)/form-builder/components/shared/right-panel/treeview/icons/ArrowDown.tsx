export const ArrowDown = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="11"
    viewBox="0 0 14 11"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M7 10.0149L0.0717972 0.872037L13.9282 0.872038L7 10.0149Z" fill="#1E293B" />
  </svg>
);
