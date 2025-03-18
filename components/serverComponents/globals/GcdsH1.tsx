export const GcdsH1 = ({ children }: { children: React.ReactNode; className?: string }) => {
  return (
    <h1 className="relative !mb-12 inline-block border-none after:absolute after:-bottom-1 after:left-0 after:h-[var(--gcds-heading-h1-border-height)] after:w-[var(--gcds-heading-h1-border-width)] after:bg-[var(--gcds-heading-h1-border-background)] after:content-['']">
      {children}
    </h1>
  );
};
