import { serverTranslation } from "@i18n";
import { ArchiveIcon, FolderIcon, GlobeIcon, PageIcon } from "@serverComponents/icons";
import { NavLink } from "./NavLink";
import { cn } from "@lib/utils";

export const Navigation = async ({ filter }: { filter?: string }) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  const iconClassname =
    "inline-block group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="flex flex-wrap" aria-label={t("navLabel")}>
      <NavLink href={`/${language}/forms`} id="tab-all" active={filter === "all" || !filter}>
        <>
          <FolderIcon className={cn(iconClassname, "w-5 h-5")} />
          {t("nav.all")}
        </>
      </NavLink>
      <NavLink href={`/${language}/forms?status=draft`} id="tab-drafts" active={filter === "draft"}>
        <>
          <PageIcon className={cn(iconClassname, "w-5 h-5")} />
          {t("nav.drafts")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=published`}
        id="tab-published"
        active={filter === "published"}
      >
        <>
          <GlobeIcon className={cn(iconClassname, "w-5 h-5")} />
          {t("nav.published")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=archived`}
        id="tab-archived"
        active={filter === "archived"}
      >
        <>
          <ArchiveIcon className={cn(iconClassname)} />
          {t("nav.archived")}
        </>
      </NavLink>
    </nav>
  );
};
