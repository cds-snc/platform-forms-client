export const ResumeUploadIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="42"
    width="42"
    viewBox="0 0 42 43"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    data-testid="InfoIcon"
  >
    {title && <title>{title}</title>}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26.25 29.375V18.875H33.25L21 6.625L8.75 18.875H15.75V29.375H26.25ZM21 11.5775L24.7975 15.375H22.75V25.875H19.25V15.375H17.2025L21 11.5775ZM33.25 36.375V32.875H8.75V36.375H33.25Z"
    />
  </svg>
);
