export const Hamburger = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="10"
    viewBox="0 0 15 10"
    fill="none"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M1 0.824463H14" stroke="black" stroke-linecap="round" />
    <path d="M1 4.82446H14" stroke="black" stroke-linecap="round" />
    <path d="M1 8.82446H14" stroke="black" stroke-linecap="round" />
  </svg>
);
