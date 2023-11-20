import React from "react";
import { Dialog, useDialogRef } from "../../shared";
import { useTranslation } from "react-i18next";
import { Button } from "@components/globals";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";

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

  const downloadFileFromBlob = (data: Blob, fileName: string) => {
    const href = window.URL.createObjectURL(data);
    const anchorElement = document.createElement("a");
    anchorElement.href = href;
    anchorElement.download = fileName;
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(href);
  };

  const handleDownload = async () => {
    const url = `/api/id/${formId}/submission/download?format=${selectedFormat}`;
    const ids = Array.from(checkedItems.keys());

    try {
      // if (selectedFormat === DownloadFormat.HTML) {
      //   const response = await axios({
      //     url,
      //     method: "POST",
      //     data: {
      //       ids: ids.join(","),
      //     },
      //   });

      //   const interval = 200;

      //   response.data.forEach((submission: { id: string; html: string }, i: number) => {
      //     setTimeout(() => {
      //       const fileName = `${submission.id}.html`;
      //       downloadFileFromBlob(new Blob([submission.html]), fileName);
      //     }, interval * i);
      //   });
      //   setTimeout(() => {
      //     onSuccessfulDownload();
      //     handleClose();
      //   }, interval * response.data.length);
      // }

      if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
        const response = await axios({
          url,
          method: "POST",
          responseType: "blob",
          data: {
            ids: ids.join(","),
          },
        });

        // @TODO: include html-aggregated in zip file
        const fileName = `records.zip`;
        downloadFileFromBlob(new Blob([response.data]), fileName);

        onSuccessfulDownload();
        handleClose();
      }

      if (selectedFormat === DownloadFormat.HTML_CSV_AGGREGATED) {
        const response = await axios({
          url,
          method: "POST",
          data: {
            ids: ids.join(","),
          },
        });

        downloadFileFromBlob(new Blob([response.data.html]), "receipt.html");
        downloadFileFromBlob(new Blob([response.data.csv]), "records.csv");

        onSuccessfulDownload();
        handleClose();
      }

      if (selectedFormat === DownloadFormat.JSON) {
        const response = await axios({
          url,
          method: "POST",
          data: {
            ids: ids.join(","),
          },
        });

        downloadFileFromBlob(
          new Blob([JSON.stringify(response.data.responses)], { type: "application/json" }),
          "records.json"
        );
        downloadFileFromBlob(new Blob([response.data.receipt]), "receipt.html");
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
            {/* Commenting out this option for now, to be revisited later. */}
            {/* <div className="mb-4">
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
            </div> */}
            <div className="mt-4 flex flex-col gap-6">
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
                  <span className="block font-semibold">Individual response files</span>
                  <span className="">Separate HTML files for each form submission.</span>
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="downloadFormat"
                  id="combined"
                  value={DownloadFormat.HTML_CSV_AGGREGATED}
                  className="gc-radio__input"
                  onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                />
                <label htmlFor="combined" className="ml-14 inline-block">
                  <span className="block font-semibold">CSV</span>
                  <span className="">For lists, spreadsheets or tables</span>
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="downloadFormat"
                  id="json"
                  value={DownloadFormat.JSON}
                  className="gc-radio__input"
                  onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                />
                <label htmlFor="combined" className="ml-14 inline-block">
                  <span className="block font-semibold">JSON</span>
                  <span className="">For API or data configuration</span>
                </label>
              </div>

              <hr />

              <div>
                <div className="gc-input-checkbox">
                  <input
                    type="checkbox"
                    name="downloadFormat"
                    id="zipped"
                    value={DownloadFormat.JSON}
                    className="gc-input-checkbox__input"
                    onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                  />
                  <label htmlFor="combined" className="ml-14 inline-block">
                    <span className="block font-semibold">Download as ZIP (compressed) file</span>
                    <span className="">May not be available in all departments or agencies.</span>
                  </label>
                </div>
              </div>
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
