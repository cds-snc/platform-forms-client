import React from "react";
export const ProtectedIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={26}
    fill="none"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
    data-testid="InfoIcon"
  >
    {title && <title>{title}</title>}
    <path
      fill="#1E293B"
      d="M8.906 16.781h3.188l-.781-4.531a2.36 2.36 0 0 0 1-.828c.25-.365.374-.766.374-1.203 0-.604-.213-1.12-.64-1.547a2.108 2.108 0 0 0-1.547-.64c-.604 0-1.12.213-1.547.64-.427.427-.64.943-.64 1.547 0 .437.124.838.374 1.203.25.364.584.64 1 .828l-.78 4.531ZM10.5 25.5c-2.917-.73-5.313-2.422-7.188-5.078C1.438 17.766.5 14.854.5 11.687V4.25L10.5.5l10 3.75v7.438c0 3.166-.938 6.078-2.813 8.734-1.875 2.656-4.27 4.349-7.187 5.078Zm0-1.938c2.396-.791 4.349-2.286 5.86-4.484 1.51-2.198 2.265-4.661 2.265-7.39V5.561L10.5 2.5 2.375 5.563v6.125c0 2.729.755 5.192 2.266 7.39 1.51 2.198 3.463 3.693 5.859 4.485Z"
    />
  </svg>
);
