import React from "react";
export const LinkIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="20"
    width="20"
    className={className}
    viewBox="0 0 20 20"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M9 14H6q-1.667 0-2.833-1.167Q2 11.667 2 10q0-1.667 1.167-2.833Q4.333 6 6 6h3v1.5H6q-1.042 0-1.771.729Q3.5 8.958 3.5 10q0 1.042.729 1.771.729.729 1.771.729h3Zm-2-3.25v-1.5h6v1.5ZM11 14v-1.5h3q1.042 0 1.771-.729.729-.729.729-1.771 0-1.042-.729-1.771Q15.042 7.5 14 7.5h-3V6h3q1.667 0 2.833 1.167Q18 8.333 18 10q0 1.667-1.167 2.833Q15.667 14 14 14Z" />
  </svg>
);
