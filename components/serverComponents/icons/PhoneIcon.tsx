export const PhoneIcon = ({ className, title }: { className?: string; title?: string }) => (
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
    <path d="M19.875 21c-2.035 0-4.055-.5-6.063-1.5-2.007-1-3.812-2.3-5.414-3.898A20.674 20.674 0 0 1 4.5 10.187C3.5 8.18 3 6.16 3 4.125c0-.316.11-.582.324-.8A1.1 1.1 0 0 1 4.125 3h3.5c.234 0 .438.078.613.238.176.157.285.371.336.637l.676 3.148c.035.235.027.45-.012.641a.965.965 0 0 1-.261.484l-2.5 2.528c.933 1.55 1.976 2.898 3.136 4.05a17.19 17.19 0 0 0 3.938 2.922l2.375-2.449c.164-.183.36-.312.574-.386.215-.075.434-.086.648-.04l2.977.653c.25.05.457.176.625.375.168.199.25.433.25.699v3.375a1.1 1.1 0 0 1-.324.8 1.1 1.1 0 0 1-.801.325ZM5.727 9.3 7.75 7.25 7.176 4.5H4.5c0 .648.102 1.363.3 2.137.2.777.509 1.664.927 2.664Zm9.222 9.075c.684.316 1.426.574 2.227.773.8.204 1.574.317 2.324.352v-2.676l-2.574-.523ZM5.727 9.301Zm9.222 9.074Zm0 0" />
  </svg>
);
