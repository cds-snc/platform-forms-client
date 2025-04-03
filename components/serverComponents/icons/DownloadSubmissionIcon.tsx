export const DownloadSubmissionIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="25"
    className={className}
    viewBox="0 0 24 25"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 10H15V4H9V10H5L12 17L19 10ZM11 12V6H13V12H14.17L12 14.17L9.83 12H11ZM19 21V19H5V21H19Z"
      fill="#F8FAFC"
    />
  </svg>
);
