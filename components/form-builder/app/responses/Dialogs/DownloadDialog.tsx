import React from "react";
import { Dialog, useDialogRef } from "../../shared";
import { useTranslation } from "react-i18next";
import { Label } from "@components/forms";
import { Button } from "@components/globals";
import { logMessage } from "@lib/logger";
import axios from "axios";

enum DownloadFormat {
  HTML = "html",
  HTML_ZIPPED = "html-zipped",
  HTML_AGGREGATED = "html-aggregated",
}

export const DownloadDialog = ({
  checkedItems,
  isVisible,
  setIsVisible,
  downloadError,
  setDownloadError,
  formId,
  onSuccessfulDownload,
}: {
  checkedItems: Map<string, boolean>;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  downloadError: boolean;
  setDownloadError: React.Dispatch<React.SetStateAction<boolean>>;
  formId: string;
  onSuccessfulDownload: () => void;
}) => {
  const dialogRef = useDialogRef();
  const { t } = useTranslation("form-builder-responses");
  const [selectedFormat, setSelectedFormat] = React.useState<DownloadFormat>();

  if (downloadError) {
    setDownloadError(false);
  }

  const handleClose = () => {
    setIsVisible(false);
    dialogRef.current?.close();
  };

  const handleDownload = async () => {
    const url = `/api/id/${formId}/submission/download?format=${selectedFormat}`;
    const ids = Array.from(checkedItems.keys());

    try {
      if (selectedFormat === "html") {
        const response = await axios({
          url,
          method: "POST",
          data: {
            ids: ids.join(","),
          },
        });

        const interval = 200;

        response.data.forEach((submission: { id: string; html: string }, i: number) => {
          setTimeout(() => {
            const fileName = `${submission.id}.html`;
            const href = window.URL.createObjectURL(new Blob([submission.html]));
            const anchorElement = document.createElement("a");
            anchorElement.href = href;
            anchorElement.download = fileName;
            document.body.appendChild(anchorElement);
            anchorElement.click();
            document.body.removeChild(anchorElement);
            window.URL.revokeObjectURL(href);
          }, interval * i);
        });
        setTimeout(() => {
          onSuccessfulDownload();
          handleClose();
        }, interval * response.data.length);
      }

      if (selectedFormat === "html-zipped") {
        const response = await axios({
          url,
          method: "POST",
          responseType: "blob",
          data: {
            ids: ids.join(","),
          },
        });

        const fileName = `records.zip`;
        const href = window.URL.createObjectURL(new Blob([response.data]));
        const anchorElement = document.createElement("a");
        anchorElement.href = href;
        anchorElement.download = fileName;
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
        onSuccessfulDownload();
        handleClose();
      }

      if (selectedFormat === "html-aggregated") {
        const response = await axios({
          url,
          method: "POST",
          responseType: "blob",
          data: {
            ids: ids.join(","),
          },
        });

        const href = window.URL.createObjectURL(response.data);
        const anchorElement = document.createElement("a");
        anchorElement.href = href;
        anchorElement.download = "records.html";
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);

        onSuccessfulDownload();
        handleClose();
      }
    } catch (err) {
      logMessage.error(err as Error);
      setDownloadError(true);
    }
  };

  return (
    <>
      {isVisible && (
        <Dialog
          title={t("downloadResponsesModals.downloadDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
        >
          <div className="p-8">
            <h3 className="mb-4 block font-semibold">
              {t("downloadResponsesModals.downloadDialog.configureDownloadSettings")}
            </h3>
            <div className="mb-4">
              <input
                type="radio"
                name="downloadFormat"
                id="individual"
                value={DownloadFormat.HTML}
                className="gc-radio__input"
                onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
              />
              <label htmlFor="individual" className="ml-14 inline-block">
                <span className="block font-semibold">
                  {t("downloadResponsesModals.downloadDialog.individualResponseFiles")}
                </span>
                <span className="block">
                  {t("downloadResponsesModals.downloadDialog.getSeparateHtmlFiles")}
                </span>
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="downloadFormat"
                id="combined"
                value={DownloadFormat.HTML_AGGREGATED}
                className="gc-radio__input"
                onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
              />
              <label htmlFor="combined" className="ml-14 inline-block">
                <span className="block font-semibold">
                  {t("downloadResponsesModals.downloadDialog.combinedResponseFiles")}
                </span>
                <span className="">
                  {t("downloadResponsesModals.downloadDialog.getHtmlAndCsv")}
                </span>
              </label>
            </div>
            <hr className="my-8" />
            <div>
              <input
                type="radio"
                name="downloadFormat"
                id="zip"
                value={DownloadFormat.HTML_ZIPPED}
                className="gc-radio__input"
                onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
              />
              <label htmlFor="zip" className="ml-14 inline-block">
                <span className="block font-semibold">
                  {t("downloadResponsesModals.downloadDialog.downloadAsZip")}
                </span>
                <span className="">
                  {t("downloadResponsesModals.downloadDialog.mayNotBeAvailable")}
                </span>
              </label>
            </div>

            <div className="mt-8 flex gap-4">
              <Button theme="secondary" onClick={handleClose}>
                {t("downloadResponsesModals.downloadDialog.cancel")}
              </Button>
              <Button theme="primary" onClick={handleDownload} disabled={!selectedFormat}>
                {t("downloadResponsesModals.downloadDialog.download")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
