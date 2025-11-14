export const ArchiveIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    width="18"
    className={className}
    viewBox="0 0 18 18"
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path d="M15 0C15.47 0 15.8804 0.209805 16.1504 0.549805L17.54 2.23047C17.8299 2.57043 18 3.02014 18 3.5V16C18 17.1 17.1 18 16 18H2C0.9 18 0 17.1 0 16V3.5C0 3.02014 0.170112 2.57043 0.459961 2.23047L1.83984 0.549805C2.11984 0.209828 2.53002 0 3 0H15ZM2 16H16V5H2V16ZM10.4502 7V10H13L9 14L5 10H7.5498V7H10.4502ZM2.44043 2.96973H15.5703L14.7598 2H3.24023L2.44043 2.96973Z" />
  </svg>
);
