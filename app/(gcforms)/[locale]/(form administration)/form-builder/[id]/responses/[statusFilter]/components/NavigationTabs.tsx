import React from "react";
import { DeleteIcon, FolderIcon, InboxIcon } from "@clientComponents/icons";
import { TabNavLink } from "@clientComponents/form-builder/app/navigation/TabNavLink";
import { VaultStatus } from "@lib/types";
import { serverTranslation } from "@i18n";

export const NavigationTabs = async ({
  statusFilter,
  formId,
  locale,
}: {
  statusFilter: string;
  formId: string;
  locale: string;
}) => {
  const { t } = await serverTranslation("form-builder-responses");

  return (
    <nav className="relative mb-10 flex border-b border-black" aria-label={t("responses.navLabel")}>
      <TabNavLink
        id="new-responses"
        defaultActive={statusFilter === VaultStatus.NEW}
        href={`/${locale}/form-builder/${formId}/responses/new`}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <InboxIcon className="inline-block h-7 w-7" /> {t("responses.status.new")}
        </span>
      </TabNavLink>
      <TabNavLink
        defaultActive={statusFilter === VaultStatus.DOWNLOADED}
        id="downloaded-responses"
        href={`/${locale}/form-builder/${formId}/responses/downloaded`}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <FolderIcon className="inline-block h-7 w-7" /> {t("responses.status.downloaded")}
        </span>
      </TabNavLink>
      <TabNavLink
        defaultActive={statusFilter === VaultStatus.CONFIRMED}
        id="deleted-responses"
        href={`/${locale}/form-builder/${formId}/responses/confirmed`}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <DeleteIcon className="inline-block h-7 w-7" /> {t("responses.status.deleted")}
        </span>
      </TabNavLink>
    </nav>
  );
};
