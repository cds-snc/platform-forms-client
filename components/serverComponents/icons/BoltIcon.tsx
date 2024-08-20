export const BoltIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    width="20"
    className={className}
    viewBox="0 0 20 20"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="m10.55 18.2 5.175-6.2h-4l.725-5.675L7.825 13H11.3l-.75 5.2ZM8 22l1-7H4l9-13h2l-1 8h6L10 22H8Z" />
  </svg>
);
