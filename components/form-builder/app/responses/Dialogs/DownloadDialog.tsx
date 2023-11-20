import React, { useEffect } from "react";
import { Dialog, useDialogRef } from "../../shared";
import { useTranslation } from "react-i18next";
import { Button } from "@components/globals";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";
import JSZip from "jszip";

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
  const [zip, setZip] = React.useState<boolean>(true);

  useEffect(() => {
    if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
      setZip(true);
    }
  }, [selectedFormat]);

  if (downloadError) {
    setDownloadError(false);
  }

  const handleClose = () => {
    setSelectedFormat(undefined);
    setZip(true);
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
      if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
        const response = await axios({
          url,
          method: "POST",
          responseType: "blob",
          data: {
            ids: ids.join(","),
          },
        });

        const fileName = `records.zip`;
        downloadFileFromBlob(new Blob([response.data]), fileName);

        onSuccessfulDownload();
        handleClose();
      }

      if (selectedFormat === DownloadFormat.CSV) {
        const response = await axios({
          url,
          method: "POST",
          data: {
            ids: ids.join(","),
          },
        });

        if (zip) {
          const file = new JSZip();
          file.file("receipt.html", response.data.receipt);
          file.file("records.csv", response.data.responses);
          file.generateAsync({ type: "nodebuffer", streamFiles: true }).then((buffer) => {
            const fileName = `records.zip`;
            downloadFileFromBlob(new Blob([buffer]), fileName);
          });
        } else {
          downloadFileFromBlob(new Blob([response.data.receipt]), "receipt.html");
          downloadFileFromBlob(new Blob([response.data.responses]), "records.csv");
        }
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

        if (zip) {
          const file = new JSZip();
          file.file("receipt.html", response.data.receipt);
          file.file("records.json", JSON.stringify(response.data.responses));
          file.generateAsync({ type: "nodebuffer", streamFiles: true }).then((buffer) => {
            const fileName = `records.zip`;
            downloadFileFromBlob(new Blob([buffer]), fileName);
          });
        } else {
          downloadFileFromBlob(
            new Blob([JSON.stringify(response.data.responses)], { type: "application/json" }),
            "records.json"
          );
          downloadFileFromBlob(new Blob([response.data.receipt]), "receipt.html");
        }
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
                  <span className="block font-semibold">
                    {t("downloadResponsesModals.downloadDialog.html")}
                  </span>
                  <span className="">
                    {t("downloadResponsesModals.downloadDialog.htmlDescription")}
                  </span>
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="downloadFormat"
                  id="combined"
                  value={DownloadFormat.CSV}
                  className="gc-radio__input"
                  onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                />
                <label htmlFor="combined" className="ml-14 inline-block">
                  <span className="block font-semibold">
                    {t("downloadResponsesModals.downloadDialog.csv")}
                  </span>
                  <span className="">
                    {t("downloadResponsesModals.downloadDialog.csvDescription")}
                  </span>
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
                  <span className="block font-semibold">
                    {t("downloadResponsesModals.downloadDialog.json")}
                  </span>
                  <span className="">
                    {t("downloadResponsesModals.downloadDialog.jsonDescription")}
                  </span>
                </label>
              </div>

              <hr />

              <div>
                <div className="gc-input-checkbox">
                  <input
                    type="checkbox"
                    name="downloadFormat"
                    id="zipped"
                    checked={zip}
                    disabled={selectedFormat === DownloadFormat.HTML_ZIPPED}
                    className="gc-input-checkbox__input"
                    onChange={() => setZip(zip === true ? false : true)}
                  />
                  <label htmlFor="combined" className="ml-14 inline-block">
                    <span className="block font-semibold">
                      {t("downloadResponsesModals.downloadDialog.downloadAllAsZip")}
                    </span>
                    <span className="">
                      {t("downloadResponsesModals.downloadDialog.mayNotBeAvailable")}
                    </span>
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
