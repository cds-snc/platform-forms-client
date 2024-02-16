export const MessageIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="21"
    width="21"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="m10.2 12.8 1.4-3.2 3.2-1.4-3.2-1.4-1.4-3.2-1.4 3.2-3.2 1.4 3.2 1.4 1.4 3.2Zm-10 7.4V1.7C.2 1.317.35.97.65.662.95.354 1.3.2 1.7.2h17c.384 0 .73.154 1.038.462.308.309.462.655.462 1.038v13c0 .383-.154.73-.462 1.038-.309.308-.654.462-1.038.462H4.2l-4 4Zm1.5-3.625L3.575 14.7H18.7v-13h-17v14.875ZM1.7 1.7v14.875V1.7Z" />
  </svg>
);
