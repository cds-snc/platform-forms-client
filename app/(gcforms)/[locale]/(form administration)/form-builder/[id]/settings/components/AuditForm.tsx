"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { getEventsForForm } from "../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";

export const AuditForm = ({ formId }: { formId: string }) => {
  const { t, i18n } = useTranslation("form-builder");

  async function retrieveFileBlob(
    events: {
      userId: string;
      event: string;
      timestamp: string;
      description: string;
    }[],
    name?: string
  ) {
    try {
      const headers = ["userId", "event", "timestamp", "description"];
      const csvHeader = headers.join(",") + "\r\n";

      const csvRows = events
        .map((row) => {
          return headers
            .map((header) => {
              const key = header as keyof typeof row;
              let value = row[key];
              if (typeof value === "string") {
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
      const fileName = name ? name : i18n.language === "fr" ? "French" : "English";

      a.href = url;
      a.download = slugify(`${fileName}-${getDate()}`) + ".csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("error creating file download");
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
        <p>{t("auditDownload.descriptionEx.line1")}</p>
        <ul className="mb-4 list-disc pl-5">
          <li>{t("auditDownload.descriptionEx.line2")}</li>
          <li>{t("auditDownload.descriptionEx.line3")}</li>
          <li>{t("auditDownload.descriptionEx.line4")}</li>
        </ul>

        <Button onClick={() => handleFormAudit(formId)} theme="primary">
          {t("auditDownload.downloadBtnText")}
        </Button>
      </div>
    </>
  );
};
