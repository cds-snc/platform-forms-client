"use client";
import React, { useEffect } from "react";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import {
  CSVResponse,
  DownloadFormat,
  HtmlZippedResponse,
  JSONResponse,
} from "@lib/responseDownloadFormats/types";
import JSZip from "jszip";
import { ga, getDate, slugify } from "@lib/client/clientHelpers";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { getSubmissionsByFormat } from "../../actions";
import { FormServerErrorCodes, Language, ServerActionError } from "@lib/types/form-builder-types";
import { FormBuilderError } from "../../exceptions";

export const DownloadDialog = ({
  checkedItems,
  isDialogVisible,
  setIsDialogVisible,
  setDownloadError,
  formId,
  formName,
  onSuccessfulDownload,
  responseDownloadLimit,
}: {
  checkedItems: Map<string, boolean>;
  isDialogVisible: boolean;
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setDownloadError: React.Dispatch<React.SetStateAction<boolean | string>>;
  formId: string;
  formName: string;
  onSuccessfulDownload: () => void;
  responseDownloadLimit: number;
}) => {
  const dialogRef = useDialogRef();
  const { t, i18n } = useTranslation("form-builder-responses");
  const defaultSelectedFormat = DownloadFormat.HTML_ZIPPED;
  const [selectedFormat, setSelectedFormat] = React.useState<DownloadFormat>(defaultSelectedFormat);
  const [zipAllFiles, setZipAllFiles] = React.useState<boolean>(true);
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);

  useEffect(() => {
    if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
      setZipAllFiles(true);
    }
  }, [selectedFormat]);

  const handleClose = () => {
    setSelectedFormat(defaultSelectedFormat);
    setZipAllFiles(true);
    setIsDialogVisible(false);
    dialogRef.current?.close();
  };

  const handleDownloadComplete = () => {
    setIsDownloading(false);
    onSuccessfulDownload();
    handleClose();
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

  const downloadFormatEvent = (
    formID: string,
    downloadType: DownloadFormat,
    numberOfRecords: number
  ) => {
    ga("download_format", {
      formID,
      downloadType,
      numberOfRecords,
    });
  };

  // Note: The API can provide additional formats, see DownloadFormat enum and update this array if needed
  const availableFormats = [DownloadFormat.CSV, DownloadFormat.JSON, DownloadFormat.HTML_ZIPPED];

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(false);
    if (!selectedFormat || !availableFormats.includes(selectedFormat)) {
      setDownloadError(FormServerErrorCodes.DOWNLOAD_INVALID_FORMAT);
      return;
    }

    if (!checkedItems.size || checkedItems.size > responseDownloadLimit) {
      setDownloadError(FormServerErrorCodes.DOWNLOAD_LIMIT_SELECTION);
      return;
    }

    const ids = Array.from(checkedItems.keys());

    const filePrefix = slugify(`${formName}-${getDate()}`) + "-";

    try {
      if (selectedFormat === DownloadFormat.HTML_ZIPPED) {
        const response = (await getSubmissionsByFormat({
          formID: formId,
          ids: ids,
          format: DownloadFormat.HTML_ZIPPED,
          lang: i18n.language as Language,
        })) as HtmlZippedResponse | ServerActionError;

        if ("error" in response) {
          throw new FormBuilderError(response.error, response.code);
        }

        downloadFormatEvent(formId, selectedFormat, ids.length);

        const zip = new JSZip();
        zip.file("_receipt-recu.html", response.receipt);

        response.responses.forEach((response: { id: string; html: string }) => {
          zip.file(`${response.id}.html`, response.html);
        });

        zip.generateAsync({ type: "nodebuffer", streamFiles: true }).then((buffer) => {
          const fileName = `${filePrefix}responses-reponses.zip`;
          downloadFileFromBlob(new Blob([buffer]), fileName);

          handleDownloadComplete();
        });
      }

      if (selectedFormat === DownloadFormat.CSV) {
        const response = (await getSubmissionsByFormat({
          formID: formId,
          ids: ids,
          format: DownloadFormat.CSV,
          lang: i18n.language as Language,
        })) as CSVResponse | ServerActionError;

        if ("error" in response) {
          throw new FormBuilderError(response.error, response.code);
        }

        downloadFormatEvent(formId, selectedFormat, ids.length);
        const universalBOMForUTF8 = "\uFEFF";

        if (zipAllFiles) {
          const file = new JSZip();

          file.file("receipt-recu.html", response.receipt);
          file.file("responses-reponses.csv", universalBOMForUTF8 + response.responses);
          file.generateAsync({ type: "nodebuffer", streamFiles: true }).then((buffer) => {
            const fileName = `${filePrefix}responses-reponses.zip`;
            downloadFileFromBlob(new Blob([buffer]), fileName);

            handleDownloadComplete();
          });
        } else {
          downloadFileFromBlob(new Blob([response.receipt]), `${filePrefix}receipt-recu.html`);
          downloadFileFromBlob(
            new Blob([universalBOMForUTF8 + response.responses]),
            `${filePrefix}responses-reponses.csv`
          );

          handleDownloadComplete();
        }
      }

      if (selectedFormat === DownloadFormat.JSON) {
        const response = (await getSubmissionsByFormat({
          formID: formId,
          ids: ids,
          format: DownloadFormat.JSON,
          lang: i18n.language as Language,
        })) as JSONResponse | ServerActionError;

        if ("error" in response) {
          throw new FormBuilderError(response.error, response.code);
        }

        downloadFormatEvent(formId, selectedFormat, ids.length);

        if (zipAllFiles) {
          const file = new JSZip();
          file.file("receipt-recu.html", response.receipt);
          file.file("responses-reponses.json", JSON.stringify(response.responses));
          file.generateAsync({ type: "nodebuffer", streamFiles: true }).then((buffer) => {
            const fileName = `${filePrefix}responses-reponses.zip`;
            downloadFileFromBlob(new Blob([buffer]), fileName);

            handleDownloadComplete();
          });
        } else {
          downloadFileFromBlob(new Blob([response.receipt]), `${filePrefix}receipt-recu.html`);
          downloadFileFromBlob(
            new Blob([JSON.stringify(response.responses)], { type: "application/json" }),
            `${filePrefix}responses-reponses.json`
          );

          handleDownloadComplete();
        }
      }
    } catch (err) {
      logMessage.error(err as Error);
      setDownloadError((err as ServerActionError).code || true);
      setIsDownloading(false);
      handleClose();
    }
  };

  return (
    <>
      {isDialogVisible && (
        <Dialog
          title={t("downloadResponsesModals.downloadDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
        >
          <div>
            <div className="p-4">
              <h3 className="mb-4 block font-semibold">
                {t("downloadResponsesModals.downloadDialog.chooseDownloadFormat")}
              </h3>
              <p className="">
                {t("downloadResponsesModals.downloadDialog.downloadFormatContext1")}
                <i>{t("downloadResponsesModals.downloadDialog.downloadFormatContext2")}</i>
                {t("downloadResponsesModals.downloadDialog.downloadFormatContext3")}
              </p>

              <div className="mt-4 flex flex-col gap-6">
                <div className="gc-input-radio">
                  <input
                    type="radio"
                    name="downloadFormat"
                    id="zip"
                    value={DownloadFormat.HTML_ZIPPED}
                    checked={selectedFormat === DownloadFormat.HTML_ZIPPED}
                    className="gc-radio__input"
                    onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                  />
                  <label htmlFor="zip" className="gc-radio-label">
                    <span className="radio-label-text">
                      <span className="block font-semibold">
                        {t("downloadResponsesModals.downloadDialog.html")}
                      </span>
                      <span className="font-normal">
                        {t("downloadResponsesModals.downloadDialog.htmlDescription")}
                      </span>
                    </span>
                  </label>
                </div>

                <div className="gc-input-radio">
                  <input
                    type="radio"
                    name="downloadFormat"
                    id="combined"
                    value={DownloadFormat.CSV}
                    checked={selectedFormat === DownloadFormat.CSV}
                    className="gc-radio__input"
                    onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                  />
                  <label htmlFor="combined" className="gc-radio-label">
                    <span className="radio-label-text">
                      <span className="block font-semibold">
                        {t("downloadResponsesModals.downloadDialog.csv")}
                      </span>
                      <span className="font-normal">
                        {t("downloadResponsesModals.downloadDialog.csvDescription")}
                      </span>
                    </span>
                  </label>
                </div>

                <div className="gc-input-radio">
                  <input
                    type="radio"
                    name="downloadFormat"
                    id="json"
                    value={DownloadFormat.JSON}
                    checked={selectedFormat === DownloadFormat.JSON}
                    className="gc-radio__input"
                    onChange={(e) => setSelectedFormat(e.target.value as DownloadFormat)}
                  />
                  <label htmlFor="json" className="gc-radio-label">
                    <span className="radio-label-text">
                      <span className="block font-semibold">
                        {t("downloadResponsesModals.downloadDialog.json")}
                      </span>
                      <span className="font-normal">
                        {t("downloadResponsesModals.downloadDialog.jsonDescription")}
                      </span>
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
                      checked={zipAllFiles}
                      disabled={selectedFormat === DownloadFormat.HTML_ZIPPED}
                      className="gc-input-checkbox__input"
                      onChange={() => setZipAllFiles(zipAllFiles === true ? false : true)}
                    />
                    <label htmlFor="zipped" className="gc-checkbox-label">
                      <span className="block font-semibold">
                        {t("downloadResponsesModals.downloadDialog.downloadAllAsZip")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex border-t-[0.5px] border-slate-500 bg-white p-4">
              <div className="flex gap-4">
                <Button theme="secondary" onClick={handleClose} disabled={isDownloading}>
                  {t("downloadResponsesModals.downloadDialog.cancel")}
                </Button>
                <Button
                  theme="primary"
                  onClick={handleDownload}
                  disabled={!selectedFormat || isDownloading}
                >
                  {t("downloadResponsesModals.downloadDialog.download")}
                </Button>
                {isDownloading && (
                  <div role="status" className="mt-2">
                    <SpinnerIcon className="size-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" />
                    <span className="sr-only">{t("loading")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
