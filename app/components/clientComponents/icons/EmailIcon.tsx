"use client";
import React from "react";

export const EmailIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M12 22a9.687 9.687 0 0 1-3.898-.79 9.994 9.994 0 0 1-3.176-2.136 9.994 9.994 0 0 1-2.137-3.176A9.687 9.687 0 0 1 2 12c0-1.383.262-2.684.79-3.898a9.994 9.994 0 0 1 2.136-3.176 9.994 9.994 0 0 1 3.176-2.137A9.687 9.687 0 0 1 12 2c1.383 0 2.684.262 3.898.79a9.994 9.994 0 0 1 3.176 2.136 9.994 9.994 0 0 1 2.137 3.176A9.687 9.687 0 0 1 22 12v1.324c0 .934-.328 1.723-.988 2.364-.657.64-1.461.96-2.41.96a3.489 3.489 0 0 1-1.704-.437 2.956 2.956 0 0 1-1.222-1.234 3.986 3.986 0 0 1-1.625 1.261 5.252 5.252 0 0 1-2.051.41c-1.3 0-2.402-.449-3.313-1.347-.91-.903-1.363-2-1.363-3.301 0-1.3.453-2.41 1.364-3.324C9.598 7.758 10.698 7.3 12 7.3c1.3 0 2.402.457 3.313 1.375.91.914 1.363 2.023 1.363 3.324v1.324c0 .516.187.95.562 1.301.375.352.828.523 1.364.523.515 0 .96-.171 1.335-.523s.563-.785.563-1.3V12c0-2.367-.824-4.375-2.477-6.023C16.375 4.324 14.367 3.5 12 3.5c-2.367 0-4.375.824-6.023 2.477C4.324 7.625 3.5 9.633 3.5 12c0 2.367.824 4.375 2.477 6.023C7.625 19.676 9.633 20.5 12 20.5h5.352V22Zm0-6.852c.883 0 1.633-.3 2.25-.91.617-.61.926-1.355.926-2.238 0-.898-.309-1.66-.926-2.273-.617-.618-1.367-.926-2.25-.926s-1.633.308-2.25.926c-.617.613-.926 1.375-.926 2.273 0 .883.309 1.629.926 2.238.617.61 1.367.91 2.25.91Zm0 0" />
  </svg>
);
