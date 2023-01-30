import React from "react";
export const ShareExternalLinkIcon = ({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) => (
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
    <path
      d="M21.6509 14.1757C21.6509 13.5526 22.1579 13.0468 22.7824 13.0468C23.4069 13.0468 23.9139 13.5526 23.9139 14.1757V20.6581C23.9139 21.578 23.538 22.414 22.9312 23.0194C22.3243 23.6249 21.4865 23.9999 20.5644 23.9999H3.34943C2.42741 23.9999 1.58956 23.6249 0.982708 23.0194C0.375856 22.414 0 21.578 0 20.6581V3.35733C0 2.43741 0.375856 1.60147 0.982708 0.996003C1.58956 0.390535 2.42741 0.0155347 3.34943 0.0155347H9.80555C10.43 0.0155347 10.937 0.521394 10.937 1.14444C10.937 1.76749 10.43 2.27335 9.80555 2.27335H3.34943C3.05188 2.27335 2.78173 2.39639 2.58401 2.59171C2.3863 2.78897 2.26493 3.0585 2.26493 3.35538V20.6562C2.26493 20.953 2.38825 21.2226 2.58401 21.4198C2.78173 21.6171 3.05188 21.7382 3.34943 21.7382H20.5664C20.8639 21.7382 21.1341 21.6151 21.3318 21.4198C21.5295 21.2245 21.6509 20.953 21.6509 20.6562V14.1757ZM22.0072 3.41007L10.5729 14.9608C10.1364 15.4042 9.4199 15.4101 8.97553 14.9745C8.53116 14.539 8.52529 13.8241 8.96183 13.3808L19.9556 2.27335H15.3788C14.7543 2.27335 14.2473 1.76749 14.2473 1.14444C14.2473 0.521394 14.7543 0.0155347 15.3788 0.0155347H20.5664C21.5687 0.0155347 22.8607 -0.154387 23.63 0.621003C24.1155 1.11124 24.0078 5.01944 23.9452 7.28311C23.9295 7.86905 23.9158 8.31632 23.9158 8.63663C23.9158 9.25968 23.4088 9.76554 22.7843 9.76554C22.1599 9.76554 21.6529 9.25968 21.6529 8.63663C21.6529 8.57608 21.6685 7.98819 21.6901 7.22257C21.7214 6.04288 21.9113 4.48038 22.0072 3.41007Z"
      fill="black"
    />
  </svg>
);
