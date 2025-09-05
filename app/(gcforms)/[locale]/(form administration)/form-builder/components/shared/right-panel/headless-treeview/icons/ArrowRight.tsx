export const ArrowRight = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="11"
    height="14"
    viewBox="0 0 11 14"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      d="M10.0938 6.91919L0.950895 13.8474L0.950895 -0.00901354L10.0938 6.91919Z"
      fill="#64748B"
    />
  </svg>
);
