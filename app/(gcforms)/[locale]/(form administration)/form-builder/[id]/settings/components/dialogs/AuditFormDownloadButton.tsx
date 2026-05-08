"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";

import { getFormEvents } from "../../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";

import { toast } from "@formBuilder/components/shared/Toast";

import { Dialog, useDialogRef } from "../../../../components/shared/Dialog";
import { FormProperties } from "@root/lib/types";

const AuditFormDownloadButton = ({
  handleClose,
  formId,
  form,
}: {
  handleClose: () => void;
  formId: string;
  form: FormProperties;
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const dialog = useDialogRef();
  const [allEventsSelected, setAllEventsSelected] = useState(true);
  const [specificEvents, setSpecificEvents] = useState({
    formBuilding: false,
    formCollaboration: false,
    responseDownloads: false,
    apiIntegrations: false,
  });

  const handleAllEventsChange = (checked: boolean) => {
    setAllEventsSelected(checked);
    if (checked) {
      setSpecificEvents({
        formBuilding: false,
        formCollaboration: false,
        responseDownloads: false,
        apiIntegrations: false,
      });
    }
  };

  const handleSpecificEventChange = (eventKey: keyof typeof specificEvents, checked: boolean) => {
    setSpecificEvents((prev) => ({ ...prev, [eventKey]: checked }));
    if (checked) {
      setAllEventsSelected(false);
    }
  };

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
                if (key == "description") {
                  // eventDesc contains the actual description text inside a JSON string
                  // the rest are parameters for interpolation
                  try {
                    const descObj = JSON.parse(value);
                    const eventDesc = descObj.eventDesc;
                    delete descObj.eventDesc;

                    // Loop through the params and translate them if they exist as a translation key
                    Object.keys(descObj).forEach((paramKey) => {
                      const paramValue = descObj[paramKey];
                      const translatedParam = t(`auditDownload.eventParams.${paramValue}`);
                      if (translatedParam !== `auditDownload.eventParams.${paramValue}`) {
                        descObj[paramKey] = translatedParam;
                      }
                    });

                    value = String(t(`auditDownload.eventDetails.${eventDesc}`, descObj));
                  } catch {
                    // Fallback to raw value if parsing fails
                  }
                }
                // Escape double quotes by doubling them and wrap the whole string in double quotes.
                value = `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",");
        })
        .join("\r\n");

      const csvContent = "\uFEFF" + csvHeader + csvRows;
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
      toast.error(t("auditDownload.errorCreatingDownload"));
    }
  }

  const handleFormAudit = async (formId: string) => {
    // get form events based on user selection
    const filter = allEventsSelected
      ? undefined
      : Object.keys(specificEvents).filter(
          (key) => specificEvents[key as keyof typeof specificEvents]
        );

    const events = await getFormEvents(formId, filter);
    if (Array.isArray(events)) {
      if (events.length === 0) {
        toast.error(t("auditDownload.noEvents"));
      } else {
        retrieveFileBlob(events);
      }
    } else {
      toast.error(t("auditDownload.errorFetchingEvents"));
    }
  };

  const actions = (
    <>
      <Button
        theme="primary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("close")}
      </Button>
      <Button
        className="ml-2"
        theme="primary"
        onClick={() => {
          handleFormAudit(formId);
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("auditDownload.dialog.downloadBtnText")}
      </Button>
    </>
  );

  return (
    <Dialog
      dialogRef={dialog}
      handleClose={handleClose}
      actions={actions}
      title={t("auditDownload.dialog.title")}
    >
      <div className="p-5">
        <div>
          <h3 className="mb-2">{t("auditDownload.dialog.allEventsTitle")}</h3>
          <p className="mb-4">{t("auditDownload.dialog.allEventsDescription")}</p>
          <div className="gc-input-checkbox">
            <input
              type="checkbox"
              id="allEvents"
              name="allEvents"
              className="gc-input-checkbox__input"
              checked={allEventsSelected}
              onChange={(e) => handleAllEventsChange(e.target.checked)}
            />
            <label htmlFor="allEvents" className="gc-checkbox-label">
              <span className="checkbox-label-text">
                {t("auditDownload.dialog.allEventsCheckbox")}
              </span>
            </label>
          </div>
          <h3 className="mt-4 mb-2">{t("auditDownload.dialog.specificEventsTitle")}</h3>
          <p className="gc-checkbox-label mb-4">
            {t("auditDownload.dialog.specificEventsDescription")}
          </p>
          <div className="gc-input-checkbox">
            <input
              type="checkbox"
              id="specificEventsformBuilding"
              name="specificEventsformBuilding"
              className="gc-input-checkbox__input"
              checked={specificEvents.formBuilding}
              onChange={(e) => handleSpecificEventChange("formBuilding", e.target.checked)}
            />
            <label htmlFor="specificEventsformBuilding" className="gc-checkbox-label">
              <span className="checkbox-label-text">
                {t("auditDownload.dialog.specific.formBuilding")}
              </span>
            </label>
          </div>
          <div className="gc-input-checkbox">
            <input
              type="checkbox"
              id="specificEventsformCollaboration"
              name="specificEventsformCollaboration"
              className="gc-input-checkbox__input"
              checked={specificEvents.formCollaboration}
              onChange={(e) => handleSpecificEventChange("formCollaboration", e.target.checked)}
            />
            <label htmlFor="specificEventsformCollaboration" className="gc-checkbox-label">
              <span className="checkbox-label-text">
                {t("auditDownload.dialog.specific.formCollaboration")}
              </span>
            </label>
          </div>
          <div className="gc-input-checkbox">
            <input
              type="checkbox"
              id="specificEventsresponseDownloads"
              name="specificEventsresponseDownloads"
              className="gc-input-checkbox__input"
              checked={specificEvents.responseDownloads}
              onChange={(e) => handleSpecificEventChange("responseDownloads", e.target.checked)}
            />
            <label htmlFor="specificEventsresponseDownloads" className="gc-checkbox-label">
              <span className="checkbox-label-text">
                {t("auditDownload.dialog.specific.responseDownloads")}
              </span>
            </label>
          </div>
          <div className="gc-input-checkbox">
            <input
              type="checkbox"
              id="specificEventsapiIntegrations"
              name="specificEventsapiIntegrations"
              className="gc-input-checkbox__input"
              checked={specificEvents.apiIntegrations}
              onChange={(e) => handleSpecificEventChange("apiIntegrations", e.target.checked)}
            />
            <label htmlFor="specificEventsapiIntegrations" className="gc-checkbox-label">
              <span className="checkbox-label-text">
                {t("auditDownload.dialog.specific.apiIntegrations")}
              </span>
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export const AuditFormDownloadDialog = ({
  formId,
  form,
}: {
  formId: string;
  form: FormProperties;
}) => {
  const { t } = useTranslation("form-builder");

  const [downloadDialog, showDownloadDialog] = useState(false);

  const handleOpenDialog = useCallback(() => {
    showDownloadDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showDownloadDialog(false);
  }, []);

  return (
    <>
      <div className="inline-block">
        <Button onClick={handleOpenDialog} theme="primary">
          {t("auditDownload.downloadBtnText")}
        </Button>
        {downloadDialog && (
          <AuditFormDownloadButton handleClose={handleCloseDialog} formId={formId} form={form} />
        )}
      </div>
    </>
  );
};
