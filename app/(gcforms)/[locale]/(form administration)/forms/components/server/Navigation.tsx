import { serverTranslation } from "@i18n";
import { FolderIcon, GlobeIcon, PageIcon } from "@serverComponents/icons";
import { NavLink } from "./NavLink";

export const Navigation = async ({ filter }: { filter?: string }) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  const iconClassname =
    "inline-block w-6 h-6 group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="flex flex-wrap laptop:mb-4" aria-label={t("navLabel")}>
      <NavLink href={`/${language}/forms`} id="tab-all" active={filter === "all" || !filter}>
        <>
          <FolderIcon className={iconClassname} />
          {t("nav.all")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?formsState=drafts`}
        id="tab-drafts"
        active={filter === "drafts"}
      >
        <>
          <PageIcon className={iconClassname} />
          {t("nav.drafts")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?formsState=published`}
        id="tab-published"
        active={filter === "published"}
      >
        <>
          <GlobeIcon className={iconClassname} />
          {t("nav.published")}
        </>
      </NavLink>
    </nav>
  );
};
