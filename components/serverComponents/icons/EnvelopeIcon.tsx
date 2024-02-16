export const EnvelopeIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="16"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M1.5 16c-.4 0-.75-.15-1.05-.45-.3-.3-.45-.65-.45-1.05v-13C0 1.1.15.75.45.45.75.15 1.1 0 1.5 0h17c.4 0 .75.15 1.05.45.3.3.45.65.45 1.05v13c0 .4-.15.75-.45 1.05-.3.3-.65.45-1.05.45h-17ZM10 8.45 1.5 2.875V14.5h17V2.875L10 8.45Zm0-1.5 8.4-5.45H1.625L10 6.95ZM1.5 2.875V1.5v13V2.875Z" />
  </svg>
);
