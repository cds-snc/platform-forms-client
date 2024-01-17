import React from "react";
export const NavPublishIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M13.8756 22.552L24.0636 12.364L22.4076 10.744L13.8756 19.276L9.55561 14.956L7.93561 16.576L13.8756 22.552ZM15.9996 30.4C14.0316 30.4 12.1716 30.022 10.4196 29.266C8.66761 28.51 7.13761 27.478 5.82961 26.17C4.52161 24.862 3.48961 23.332 2.73361 21.58C1.97761 19.828 1.59961 17.968 1.59961 16C1.59961 14.008 1.97761 12.136 2.73361 10.384C3.48961 8.63201 4.52161 7.10801 5.82961 5.81201C7.13761 4.51601 8.66761 3.49001 10.4196 2.73401C12.1716 1.97801 14.0316 1.60001 15.9996 1.60001C17.9916 1.60001 19.8636 1.97801 21.6156 2.73401C23.3676 3.49001 24.8916 4.51601 26.1876 5.81201C27.4836 7.10801 28.5096 8.63201 29.2656 10.384C30.0216 12.136 30.3996 14.008 30.3996 16C30.3996 17.968 30.0216 19.828 29.2656 21.58C28.5096 23.332 27.4836 24.862 26.1876 26.17C24.8916 27.478 23.3676 28.51 21.6156 29.266C19.8636 30.022 17.9916 30.4 15.9996 30.4ZM15.9996 28.24C19.4076 28.24 22.2996 27.046 24.6756 24.658C27.0516 22.27 28.2396 19.384 28.2396 16C28.2396 12.592 27.0516 9.70001 24.6756 7.32401C22.2996 4.94801 19.4076 3.76001 15.9996 3.76001C12.6156 3.76001 9.72961 4.94801 7.34161 7.32401C4.95361 9.70001 3.75961 12.592 3.75961 16C3.75961 19.384 4.95361 22.27 7.34161 24.658C9.72961 27.046 12.6156 28.24 15.9996 28.24Z" />
  </svg>
);
