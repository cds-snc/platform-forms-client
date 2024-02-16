export const ConditionalIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="14"
    width="15"
    className={className}
    fill="none"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      fill="#1E293B"
      d="M0 .5v9c0 .55.196 1.02.588 1.412.391.392.862.588 1.412.588h8.2l-1.6 1.6 1.4 1.4 4-4-4-4-1.4 1.4 1.6 1.6H2v-9H0Z"
    />
  </svg>
);
