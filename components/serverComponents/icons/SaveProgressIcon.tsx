export const SaveProgressIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="25"
    className={className}
    viewBox="0 0 25 24"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.5 3H17.5L21.5 7V19C21.5 20.1 20.6 21 19.5 21H5.5C4.39 21 3.5 20.1 3.5 19V5C3.5 3.9 4.39 3 5.5 3ZM19.5 19V7.83L16.67 5H5.5V19H19.5ZM12.5 12C10.84 12 9.5 13.34 9.5 15C9.5 16.66 10.84 18 12.5 18C14.16 18 15.5 16.66 15.5 15C15.5 13.34 14.16 12 12.5 12ZM15.5 6H6.5V10H15.5V6Z"
    />
  </svg>
);
