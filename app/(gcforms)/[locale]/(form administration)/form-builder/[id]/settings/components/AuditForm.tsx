"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { AuditFormDownloadDialog } from "./dialogs/AuditFormDownloadButton";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

export const AuditForm = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");

  const { form } = useTemplateStore((s) => ({
    form: s.form,
  }));

  const { getFlag } = useFeatureFlags();
  const canPerformUsersideAudit = getFlag("userSideAuditLogs");

  return (
    <>
      {canPerformUsersideAudit && (
        <div id="download-form" className="mb-10">
          <h2>{t("auditDownload.title")}</h2>
          <p className="mb-4" id="download-hint">
            {t("auditDownload.description")}
          </p>

          <AuditFormDownloadDialog formId={formId} form={form} />
        </div>
      )}
    </>
  );
};
