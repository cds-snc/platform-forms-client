export const DragIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="17"
    viewBox="0 0 10 17"
    className={className}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      d="M2 16.5C1.45 16.5 0.979167 16.3042 0.5875 15.9125C0.195833 15.5208 0 15.05 0 14.5C0 13.95 0.195833 13.4792 0.5875 13.0875C0.979167 12.6958 1.45 12.5 2 12.5C2.55 12.5 3.02083 12.6958 3.4125 13.0875C3.80417 13.4792 4 13.95 4 14.5C4 15.05 3.80417 15.5208 3.4125 15.9125C3.02083 16.3042 2.55 16.5 2 16.5ZM8 16.5C7.45 16.5 6.97917 16.3042 6.5875 15.9125C6.19583 15.5208 6 15.05 6 14.5C6 13.95 6.19583 13.4792 6.5875 13.0875C6.97917 12.6958 7.45 12.5 8 12.5C8.55 12.5 9.02083 12.6958 9.4125 13.0875C9.80417 13.4792 10 13.95 10 14.5C10 15.05 9.80417 15.5208 9.4125 15.9125C9.02083 16.3042 8.55 16.5 8 16.5ZM2 10.5C1.45 10.5 0.979167 10.3042 0.5875 9.9125C0.195833 9.52083 0 9.05 0 8.5C0 7.95 0.195833 7.47917 0.5875 7.0875C0.979167 6.69583 1.45 6.5 2 6.5C2.55 6.5 3.02083 6.69583 3.4125 7.0875C3.80417 7.47917 4 7.95 4 8.5C4 9.05 3.80417 9.52083 3.4125 9.9125C3.02083 10.3042 2.55 10.5 2 10.5ZM8 10.5C7.45 10.5 6.97917 10.3042 6.5875 9.9125C6.19583 9.52083 6 9.05 6 8.5C6 7.95 6.19583 7.47917 6.5875 7.0875C6.97917 6.69583 7.45 6.5 8 6.5C8.55 6.5 9.02083 6.69583 9.4125 7.0875C9.80417 7.47917 10 7.95 10 8.5C10 9.05 9.80417 9.52083 9.4125 9.9125C9.02083 10.3042 8.55 10.5 8 10.5ZM2 4.5C1.45 4.5 0.979167 4.30417 0.5875 3.9125C0.195833 3.52083 0 3.05 0 2.5C0 1.95 0.195833 1.47917 0.5875 1.0875C0.979167 0.695833 1.45 0.5 2 0.5C2.55 0.5 3.02083 0.695833 3.4125 1.0875C3.80417 1.47917 4 1.95 4 2.5C4 3.05 3.80417 3.52083 3.4125 3.9125C3.02083 4.30417 2.55 4.5 2 4.5ZM8 4.5C7.45 4.5 6.97917 4.30417 6.5875 3.9125C6.19583 3.52083 6 3.05 6 2.5C6 1.95 6.19583 1.47917 6.5875 1.0875C6.97917 0.695833 7.45 0.5 8 0.5C8.55 0.5 9.02083 0.695833 9.4125 1.0875C9.80417 1.47917 10 1.95 10 2.5C10 3.05 9.80417 3.52083 9.4125 3.9125C9.02083 4.30417 8.55 4.5 8 4.5Z"
      fill="#64748B"
    />
  </svg>
);
