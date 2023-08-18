import React from "react";
export const LockIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    className={className}
    fill="none"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      d="M6.702 7.935C6.556 5.957 7.362 2 11.76 2c1.65.157 4.86 1.564 4.509 5.935M4.284 23h14.632c1.206 0 2.184-1.022 2.184-2.283V9.99c0-1.26-.978-2.282-2.184-2.282H4.284C3.078 7.707 2.1 8.728 2.1 9.989v10.728C2.1 21.978 3.078 23 4.284 23Z"
      stroke="#000"
      strokeWidth={2}
      fill="none"
    />
  </svg>
);
