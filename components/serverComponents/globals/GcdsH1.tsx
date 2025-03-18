import { cn } from "@lib/utils";

export const GcdsH1 = ({
  children,
  tabIndex,
  className,
}: {
  children: React.ReactNode;
  tabIndex?: number;
  className?: string;
}) => {
  return (
    <h1
      tabIndex={tabIndex || 0}
      className={cn(
        "relative !mb-12 inline-block border-none after:absolute after:-bottom-1 after:left-0 after:h-[var(--gcds-heading-h1-border-height)] after:w-[var(--gcds-heading-h1-border-width)] after:bg-[var(--gcds-heading-h1-border-background)] after:content-['']",
        className
      )}
    >
      {children}
    </h1>
  );
};
