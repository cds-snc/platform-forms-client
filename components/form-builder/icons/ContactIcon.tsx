import React from "react";
export const ContactIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 48 48"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M4 34V6.1q0-.7.65-1.4T6 4h25.95q.75 0 1.4.675Q34 5.35 34 6.1v17.8q0 .7-.65 1.4t-1.4.7H12Zm10.05 2q-.7 0-1.375-.7T12 33.9V29h25V12h5q.7 0 1.35.7.65.7.65 1.45v29.8L36.05 36ZM31 7H7v19.75L10.75 23H31ZM7 7v19.75Z" />
  </svg>
);
