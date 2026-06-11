import { serverTranslation } from "@i18n";
import { ArchiveIcon, FolderIcon, GlobeIcon, PageIcon } from "@serverComponents/icons";
import { NavLink } from "./NavLink";
import { cn } from "@lib/utils";
import { FormTabStatus, TAB_STATUS } from "../types";

<<<<<<< HEAD
export const Navigation = async ({ filter }: { filter?: string }) => {
=======
export const Navigation = async ({ filter }: { filter: FormTabStatus; templateCount?: number }) => {
>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  const iconClassname =
    "inline-block group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
<<<<<<< HEAD
    <nav className="flex flex-wrap" aria-label={t("navLabel")}>
      <NavLink href={`/${language}/forms`} id="tab-all" active={filter === "all" || !filter}>
=======
    <nav className="flex flex-col" aria-label={t("navLabel")}>
      <NavLink
        href={`/${language}/forms`}
        id="tab-all"
        active={filter === TAB_STATUS.RECENTLY_EDITED || !filter}
      >
>>>>>>> c586e2491e1742be824d9148801aeef5c47f7e37
        <>
          <FolderIcon className={cn(iconClassname, "w-5 h-5")} />
          {t("nav.all")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=draft`}
        id="tab-drafts"
        active={filter === TAB_STATUS.DRAFT}
      >
        <>
          <PageIcon className={cn(iconClassname, "w-5 h-5")} />
          {t("nav.drafts")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=published`}
        id="tab-published"
        active={filter === TAB_STATUS.PUBLISHED}
      >
        <>
          <GlobeIcon className={cn(iconClassname, "w-5 h-5")} />
          {t("nav.published")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=archived`}
        id="tab-archived"
        active={filter === TAB_STATUS.ARCHIVED}
      >
        <>
          <ArchiveIcon className={cn(iconClassname)} />
          {t("nav.archived")}
        </>
      </NavLink>
    </nav>
  );
};
