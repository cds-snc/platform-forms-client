import React from "react";
import { Dialog, useDialogRef } from "../../shared";
import { useTranslation } from "react-i18next";
import { Label } from "@components/forms";
import { Button } from "@components/globals";

export const DownloadDialog = ({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dialogRef = useDialogRef();
  const { t } = useTranslation("form-builder-responses");

  const handleClose = () => {
    setIsVisible(false);
    dialogRef.current?.close();
  };

  const handleDownload = () => {
    alert("not yet implemented");
  };

  // The following was saved from DownloadButton to be adapted for use here.
  //
  //
  // const handleDownload = async () => {
  //   // Reset any errors
  //   if (downloadError) {
  //     setDownloadError(false);
  //   }

  //   // Can't download if none selected
  //   if (checkedItems.size === 0) {
  //     setNoSelectedItemsError(true);
  //     return;
  //   }

  //   // Don't download if too many selected
  //   if (!canDownload) {
  //     return;
  //   }

  //   toast.info(
  //     t("downloadResponsesTable.notifications.downloadingXFiles", {
  //       fileCount: checkedItems.size,
  //     })
  //   );

  //   const url = `/api/id/${formId}/submission/download?format=html`;
  //   const ids = Array.from(checkedItems.keys());

  //   axios({
  //     url,
  //     method: "POST",
  //     data: {
  //       ids: ids.join(","),
  //     },
  //   })
  //     .then((response) => {
  //       const interval = 200;
  //       response.data.forEach((submission: { id: string; html: string }, i: number) => {
  //         setTimeout(() => {
  //           const fileName = `${submission.id}.html`;
  //           const href = window.URL.createObjectURL(new Blob([submission.html]));
  //           const anchorElement = document.createElement("a");
  //           anchorElement.href = href;
  //           anchorElement.download = fileName;
  //           document.body.appendChild(anchorElement);
  //           anchorElement.click();
  //           document.body.removeChild(anchorElement);
  //           window.URL.revokeObjectURL(href);
  //         }, interval * i);
  //       });
  //       setTimeout(() => {
  //         onSuccessfulDownload();
  //       }, interval * response.data.length);
  //     })
  //     .catch((err) => {
  //       logMessage.error(err as Error);
  //       setDownloadError(true);
  //     });
  // };

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
                value="individual"
                className="gc-radio__input"
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
                value="combined"
                className="gc-radio__input"
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
                value="zip"
                className="gc-radio__input"
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
              <Button theme="primary" onClick={handleDownload}>
                {t("downloadResponsesModals.downloadDialog.download")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
