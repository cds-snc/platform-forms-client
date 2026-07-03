import { serverTranslation } from "@i18n";
import {
  ArchiveIcon,
  ClosedStatusIcon,
  FolderIcon,
  GlobeIcon,
  PageIcon,
} from "@serverComponents/icons";
import { NavLink } from "./NavLink";
import { cn } from "@lib/utils";
import { FormTabStatus, TAB_STATUS } from "../types";

export const Navigation = async ({ filter }: { filter: FormTabStatus }) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  const iconClassname =
    "inline-block group-hover:fill-blue-hover group-focus:fill-white-default group-active:fill-white-default mr-2 -mt-1";

  return (
    <nav className="flex flex-col" aria-label={t("navLabel")}>
      <NavLink
        href={`/${language}/forms`}
        id="tab-all"
        active={filter === TAB_STATUS.RECENTLY_EDITED || !filter}
      >
        <>
          <FolderIcon className={cn(iconClassname, "h-5 w-5")} />
          {t("nav.recentlyEdited")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=draft`}
        id="tab-drafts"
        active={filter === TAB_STATUS.DRAFT}
      >
        <>
          <PageIcon className={cn(iconClassname, "h-5 w-5")} />
          {t("nav.drafts")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=published`}
        id="tab-published"
        active={filter === TAB_STATUS.PUBLISHED}
      >
        <>
          <GlobeIcon className={cn(iconClassname, "h-5 w-5")} />
          {t("nav.published")}
        </>
      </NavLink>
      <NavLink
        href={`/${language}/forms?status=closed`}
        id="tab-closed"
        active={filter === TAB_STATUS.CLOSED}
      >
        <>
          <ClosedStatusIcon className={cn(iconClassname, "h-5 w-5")} />
          {t("nav.closed")}
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
