export const LargeAddIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5 39C30.2696 39 39 30.2696 39 19.5C39 8.73045 30.2696 0 19.5 0C8.73045 0 0 8.73045 0 19.5C0 30.2696 8.73045 39 19.5 39ZM20.4993 10.25C20.4993 9.55964 19.9397 9 19.2493 9C18.559 9 17.9993 9.55964 17.9993 10.25V18.5001H10.25C9.55965 18.5001 9 19.0598 9 19.7501C9 20.4405 9.55965 21.0001 10.25 21.0001H17.9993V28.75C17.9993 29.4404 18.559 30 19.2493 30C19.9397 30 20.4993 29.4404 20.4993 28.75V21.0001H28.75C29.4404 21.0001 30 20.4405 30 19.7501C30 19.0598 29.4404 18.5001 28.75 18.5001H20.4993V10.25Z"
    />
  </svg>
);
