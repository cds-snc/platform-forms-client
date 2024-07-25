/**
  Example usage basic:
  <SkipLinkReusable anchor="#idOnHeading">{t("linkTitle")}</SkipLinkReusable>

  Example usage with custom styling:
  <SkipLinkReusable anchor="#idOnHeading">
    <span className="bg-blue">{t("linkTitle")}</span>
  </SkipLinkReusable>
 */
export const SkipLinkReusable = ({
  children,
  anchor,
}: {
  children: string | React.ReactNode;
  anchor: string;
}) => {
  const skipLinkClass = `
    absolute w-[1px] h-[1px] truncate whitespace-nowrap 
    focus:block focus:w-auto focus:h-auto focus:overflow-auto focus:bg-white focus:p-2 
  `;
  return (
    <div className="relative">
      <div className="absolute z-10">
        <a href={anchor} className={skipLinkClass}>
          {children}
        </a>
      </div>
    </div>
  );
};
