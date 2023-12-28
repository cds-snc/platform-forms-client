import React from "react";
export const ExclamationIcon = ({
  className,
  title,
  width,
}: {
  className?: string;
  title?: string;
  width?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width ? "auto" : "16"}
    height={width ? "auto" : "16"}
    className={className}
    viewBox="0 0 16 16"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <g clipPath="url(#clip0_4380_36047)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.400024 8.00002C0.400024 3.80482 3.80482 0.400024 8.00002 0.400024C12.1952 0.400024 15.6 3.80482 15.6 8.00002C15.6 12.1952 12.1952 15.6 8.00002 15.6C3.80482 15.6 0.400024 12.1952 0.400024 8.00002Z"
        fill="#BC3331"
      />
      <path
        d="M8.75999 11.04C8.75999 11.4598 8.41973 11.8 7.99999 11.8C7.58025 11.8 7.23999 11.4598 7.23999 11.04C7.23999 10.6203 7.58025 10.28 7.99999 10.28C8.41973 10.28 8.75999 10.6203 8.75999 11.04Z"
        fill="white"
      />
      <path
        d="M8.75999 8.00001C8.75999 8.41975 8.41973 8.76001 7.99999 8.76001C7.58025 8.76001 7.23999 8.41975 7.23999 8.00001V4.96001C7.23999 4.54028 7.58025 4.20001 7.99999 4.20001C8.41973 4.20001 8.75999 4.54028 8.75999 4.96001V8.00001Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_4380_36047">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
