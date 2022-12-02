import React from "react";
export const GearIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="34"
    width="34"
    className={className}
    viewBox="0 0 34 34"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      d="M13.1666 33.6667L12.3333 28.4167C11.8055 28.2223 11.25 27.9584 10.6666 27.625C10.0833 27.2917 9.56942 26.9445 9.12498 26.5834L4.20831 28.8334L0.333313 22L4.83331 18.7084C4.77776 18.4584 4.74303 18.1737 4.72915 17.8542C4.71526 17.5348 4.70831 17.25 4.70831 17C4.70831 16.75 4.71526 16.4653 4.72915 16.1459C4.74303 15.8264 4.77776 15.5417 4.83331 15.2917L0.333313 12L4.20831 5.16671L9.12498 7.41671C9.56942 7.0556 10.0833 6.70837 10.6666 6.37504C11.25 6.04171 11.8055 5.79171 12.3333 5.62504L13.1666 0.333374H20.8333L21.6666 5.58337C22.1944 5.77782 22.7569 6.03476 23.3541 6.35421C23.9514 6.67365 24.4583 7.02782 24.875 7.41671L29.7916 5.16671L33.6666 12L29.1666 15.2084C29.2222 15.4862 29.2569 15.7848 29.2708 16.1042C29.2847 16.4237 29.2916 16.7223 29.2916 17C29.2916 17.2778 29.2847 17.5695 29.2708 17.875C29.2569 18.1806 29.2222 18.4723 29.1666 18.75L33.6666 22L29.7916 28.8334L24.875 26.5834C24.4305 26.9445 23.9236 27.2987 23.3541 27.6459C22.7847 27.9931 22.2222 28.25 21.6666 28.4167L20.8333 33.6667H13.1666ZM17 22.4167C18.5 22.4167 19.7778 21.8889 20.8333 20.8334C21.8889 19.7778 22.4166 18.5 22.4166 17C22.4166 15.5 21.8889 14.2223 20.8333 13.1667C19.7778 12.1112 18.5 11.5834 17 11.5834C15.5 11.5834 14.2222 12.1112 13.1666 13.1667C12.1111 14.2223 11.5833 15.5 11.5833 17C11.5833 18.5 12.1111 19.7778 13.1666 20.8334C14.2222 21.8889 15.5 22.4167 17 22.4167ZM17 19.9167C16.1944 19.9167 15.5069 19.632 14.9375 19.0625C14.368 18.4931 14.0833 17.8056 14.0833 17C14.0833 16.1945 14.368 15.507 14.9375 14.9375C15.5069 14.3681 16.1944 14.0834 17 14.0834C17.8055 14.0834 18.493 14.3681 19.0625 14.9375C19.6319 15.507 19.9166 16.1945 19.9166 17C19.9166 17.8056 19.6319 18.4931 19.0625 19.0625C18.493 19.632 17.8055 19.9167 17 19.9167ZM15.1666 31.1667H18.8333L19.4166 26.5C20.3333 26.2778 21.2014 25.9306 22.0208 25.4584C22.8403 24.9862 23.5833 24.4167 24.25 23.75L28.6666 25.6667L30.3333 22.6667L26.4166 19.7917C26.5278 19.3195 26.618 18.8542 26.6875 18.3959C26.7569 17.9375 26.7916 17.4723 26.7916 17C26.7916 16.5278 26.7639 16.0625 26.7083 15.6042C26.6528 15.1459 26.5555 14.6806 26.4166 14.2084L30.3333 11.3334L28.6666 8.33337L24.25 10.25C23.6111 9.52782 22.8889 8.92365 22.0833 8.43754C21.2778 7.95143 20.3889 7.63893 19.4166 7.50004L18.8333 2.83337H15.1666L14.5833 7.50004C13.6389 7.69449 12.7569 8.02782 11.9375 8.50004C11.118 8.97226 10.3889 9.5556 9.74998 10.25L5.33331 8.33337L3.66665 11.3334L7.58331 14.2084C7.4722 14.6806 7.38192 15.1459 7.31248 15.6042C7.24303 16.0625 7.20831 16.5278 7.20831 17C7.20831 17.4723 7.24303 17.9375 7.31248 18.3959C7.38192 18.8542 7.4722 19.3195 7.58331 19.7917L3.66665 22.6667L5.33331 25.6667L9.74998 23.75C10.4166 24.4167 11.1597 24.9862 11.9791 25.4584C12.7986 25.9306 13.6666 26.2778 14.5833 26.5L15.1666 31.1667Z"
      fill="black"
    />
  </svg>
);
