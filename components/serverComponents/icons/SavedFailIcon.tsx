export const SavedFailIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      fill="#BC3331"
      d="M6.2 17 5 15.8 9.8 11 5 6.2 6.2 5 11 9.8 15.8 5 17 6.2 12.2 11l4.8 4.8-1.2 1.2-4.8-4.8L6.2 17Z"
    />
  </svg>
);
