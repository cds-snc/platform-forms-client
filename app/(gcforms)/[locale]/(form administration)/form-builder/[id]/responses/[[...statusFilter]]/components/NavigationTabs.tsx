"use client";
import React from "react";
import { DeleteIcon, FolderIcon, InboxIcon } from "@serverComponents/icons";
import { TabNavLink } from "@clientComponents/globals/TabNavLink";
import { usePathname } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { ManageFormAccessButton } from "./ManageFormAccessDialog/ManageFormAccessButton";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const NavigationTabs = ({ formId }: { formId: string }) => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("form-builder-responses");
  const pathname = usePathname();
  const { isPublished } = useTemplateStore((s) => {
    return {
      isPublished: s.isPublished,
    };
  });

  return (
    <nav className="relative mb-10 flex border-b border-black" aria-label={t("responses.navLabel")}>
      <TabNavLink
        id="new-responses"
        href={`/${locale}/form-builder/${formId}/responses`}
        active={pathname.includes("new") || pathname.endsWith("responses")}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <InboxIcon className="inline-block size-7" /> {t("responses.status.new")}
        </span>
      </TabNavLink>
      <TabNavLink
        id="downloaded-responses"
        href={`/${locale}/form-builder/${formId}/responses/downloaded`}
        active={pathname.includes("downloaded")}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <FolderIcon className="inline-block size-7" /> {t("responses.status.downloaded")}
        </span>
      </TabNavLink>
      <TabNavLink
        id="deleted-responses"
        href={`/${locale}/form-builder/${formId}/responses/confirmed`}
        active={pathname.includes("confirmed")}
        setAriaCurrent={true}
      >
        <span className="text-sm laptop:text-base">
          <DeleteIcon className="inline-block size-7" /> {t("responses.status.deleted")}
        </span>
      </TabNavLink>

      {isPublished && (
        <div className="absolute right-0">
          <ManageFormAccessButton />
        </div>
      )}
    </nav>
  );
};
