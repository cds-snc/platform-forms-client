"use client";
import React from "react";
import { DeleteIcon, FolderIcon, InboxIcon } from "@serverComponents/icons";
import { TabNavLink } from "@clientComponents/form-builder/app/navigation/TabNavLink";
import { usePathname } from "next/navigation";
import { useTranslation } from "@i18n/client";

export const NavigationTabs = ({
  formId,
  locale,
}: {
  statusFilter: string;
  formId: string;
  locale: string;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const pathname = usePathname();

  return (
    <nav className="relative mb-10 flex border-b border-black" aria-label={t("responses.navLabel")}>
      <TabNavLink
        id="new-responses"
        href={`/${locale}/form-builder/${formId}/responses/new`}
        active={pathname.includes("new")}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <InboxIcon className="inline-block h-7 w-7" /> {t("responses.status.new")}
        </span>
      </TabNavLink>
      <TabNavLink
        id="downloaded-responses"
        href={`/${locale}/form-builder/${formId}/responses/downloaded`}
        active={pathname.includes("downloaded")}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <FolderIcon className="inline-block h-7 w-7" /> {t("responses.status.downloaded")}
        </span>
      </TabNavLink>
      <TabNavLink
        id="deleted-responses"
        href={`/${locale}/form-builder/${formId}/responses/confirmed`}
        active={pathname.includes("confirmed")}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <DeleteIcon className="inline-block h-7 w-7" /> {t("responses.status.deleted")}
        </span>
      </TabNavLink>
    </nav>
  );
};
