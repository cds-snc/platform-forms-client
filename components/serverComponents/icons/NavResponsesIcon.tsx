export const NavResponsesIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M15.9996 19.744L18.0156 15.136L22.6236 13.12L18.0156 11.104L15.9996 6.49601L13.9836 11.104L9.37561 13.12L13.9836 15.136L15.9996 19.744ZM1.59961 30.4V3.76001C1.59961 3.20801 1.81561 2.71001 2.24761 2.26601C2.67961 1.82201 3.18361 1.60001 3.75961 1.60001H28.2396C28.7916 1.60001 29.2896 1.82201 29.7336 2.26601C30.1776 2.71001 30.3996 3.20801 30.3996 3.76001V22.48C30.3996 23.032 30.1776 23.53 29.7336 23.974C29.2896 24.418 28.7916 24.64 28.2396 24.64H7.35961L1.59961 30.4ZM3.75961 25.18L6.45961 22.48H28.2396V3.76001H3.75961V25.18ZM3.75961 3.76001V25.18V3.76001Z" />
  </svg>
);
