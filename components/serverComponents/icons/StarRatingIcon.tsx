import { cn } from "@lib/utils";

export const StarRatingIcon = ({
  active = false,
  className,
  title,
}: {
  active?: boolean;
  className?: string;
  title?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    // className if passed will override since CN is used to merge
    className={cn(active ? "text-gcds-yellow-400" : "text-gray-300", className)}
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      d="M12 2.5l2.93 5.94 6.56.95-4.74 4.62 1.12 6.53L12 17.45l-5.87 3.09 1.12-6.53-4.74-4.62 6.56-.95L12 2.5z"
      fill="currentColor"
    />
  </svg>
);
