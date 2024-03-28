export const ForwardArrowIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M686-450H160v-60h526L438-758l42-42 320 320-320 320-42-42 248-248Z" />
  </svg>
);
