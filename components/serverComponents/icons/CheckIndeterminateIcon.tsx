export const CheckIndeterminateIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="48"
    width="48"
    className={className}
    viewBox="0 -960 960 960"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M250-452h461v-60H250v60Zm-70 332q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm0-600v600-600Z" />
  </svg>
);
