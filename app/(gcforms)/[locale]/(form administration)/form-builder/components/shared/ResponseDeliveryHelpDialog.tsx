"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useDialogRef, Dialog } from ".";
import { InfoIcon } from "@serverComponents/icons";

const ResponseDeliveryHelpDialog = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

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
    </>
  );

  return (
    <Dialog
      dialogRef={dialog}
      handleClose={handleClose}
      actions={actions}
      className="max-h-[80%] min-w-[800px] overflow-y-scroll"
      title={t("settingsResponseDelivery.responseDeliveryHelp.title")}
    >
      <div className="p-5">
        <div className="mt-0">
          <p className="mb-4 text-sm">
            {t("settingsResponseDelivery.responseDeliveryHelp.description")}
          </p>
          <table className="mb-4">
            <thead className="border-b-3">
              <tr>
                <th className="p-2 text-left">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.title")}
                </th>
                <th className="whitespace-nowrap p-2 text-left">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.title")}
                </th>
                <th className="p-2 text-left">
                  {t("settingsResponseDelivery.responseDeliveryHelp.api.title")}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text1")}
                </td>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text1")}
                </td>
                <td className="border-b-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.api.text1")}
                </td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text2")}
                </td>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text2")}
                </td>
                <td className="border-b-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.api.text2")}
                </td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text3")}
                </td>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text3")}
                </td>
                <td className="border-b-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.api.text3")}
                </td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text4")}
                </td>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text4")}
                </td>
                <td className="border-b-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.api.text4")}
                </td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text5")}
                </td>
                <td className="border-b-2 border-r-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text5")}
                </td>
                <td className="border-b-2 p-2 align-top text-sm">
                  {t("settingsResponseDelivery.responseDeliveryHelp.api.text5")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Dialog>
  );
};

export const ResponseDeliveryHelpButton = () => {
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
      <InfoIcon className="ml-4 inline-block" />
      <div className="ml-2 inline-block">
        <Button onClick={handleOpenDialog} theme="link">
          {t("settingsResponseDelivery.responseDeliveryHelp.cta")}
        </Button>
        {downloadDialog && <ResponseDeliveryHelpDialog handleClose={handleCloseDialog} />}
      </div>
    </>
  );
};
