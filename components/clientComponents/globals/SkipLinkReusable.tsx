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
  return (
    <div className="relative">
      <div className="absolute z-10">
        <a
          href={anchor}
          className="absolute size-[1px] truncate whitespace-nowrap focus:block focus:size-auto focus:overflow-auto focus:bg-white focus:p-2"
        >
          {children}
        </a>
      </div>
    </div>
  );
};
