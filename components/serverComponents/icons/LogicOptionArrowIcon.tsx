export const LogicOptionArrowIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    width="16"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      fill="#047857"
      d="M0 0v10.286A2.2 2.2 0 0 0 .671 11.9c.448.448.986.671 1.615.671h9.371L9.83 14.4l1.6 1.6L16 11.429l-4.571-4.572-1.6 1.6 1.828 1.829H2.286V0H0Z"
    />
  </svg>
);
