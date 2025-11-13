"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { getEventsForForm } from "../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const AuditForm = ({ formId }: { formId: string }) => {
  const { t, i18n } = useTranslation("form-builder");

  const { form } = useTemplateStore((s) => ({
    form: s.form,
  }));

  function retrieveFileBlob(
    events: {
      userId: string;
      event: string;
      timestamp: string;
      description: string;
    }[],
    name?: string
  ) {
    try {
      const columns = ["formId", "userId", "event", "timestamp", "description"];
      const headers = [
        t("auditDownload.headers.formId"),
        t("auditDownload.headers.userId"),
        t("auditDownload.headers.event"),
        t("auditDownload.headers.timestamp"),
        t("auditDownload.headers.description"),
      ];
      const csvHeader = headers.join(",") + "\r\n";

      const csvRows = events
        .map((row) => {
          return columns
            .map((columns) => {
              const key = columns as keyof typeof row;
              let value = row[key];
              if (typeof value === "string") {
                if (key === "event") {
                  value = `"${t(`auditDownload.events.${row.event}`)}"`; // Translate event names
                }
                // Escape double quotes by doubling them and wrap the whole string in double quotes.
                value = `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",");
        })
        .join("\r\n");

      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const fileName = name
        ? name
        : i18n.language === "fr"
          ? form.titleFr + "-JournalAudit-fr"
          : form.titleEn + "-AuditLog-en";

      a.href = url;
      a.download = slugify(`${fileName}-${getDate()}`) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(t("auditDownload.errorCreatingDownload"));
    }
  }

  const handleFormAudit = async (formId: string) => {
    const events = await getEventsForForm(formId);
    retrieveFileBlob(events);
  };

  return (
    <>
      <div id="download-form" className="mb-10">
        <h2>{t("auditDownload.title")}</h2>
        <p className="mb-4" id="download-hint">
          {t("auditDownload.description")}
        </p>

        <Button onClick={() => handleFormAudit(formId)} theme="primary">
          {t("auditDownload.downloadBtnText")}
        </Button>
      </div>
    </>
  );
};
