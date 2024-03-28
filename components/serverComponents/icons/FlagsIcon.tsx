export const FlagsIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    width="26"
    height="30"
    viewBox="0 0 26 30"
    xmlns="http://www.w3.org/2000/svg"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    className={className}
  >
    {title && <title>{title}</title>}
    <path d="M0.5 29.1666V0.833313H14.7917L15.5833 4.41665H25.5V19.8333H14.8333L14.0445 16.2916H3V29.1666H0.5ZM16.9583 17.3333H23V6.91665H13.4583L12.6667 3.33331H3V13.7916H16.1667L16.9583 17.3333Z" />
  </svg>
);
