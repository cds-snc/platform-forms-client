import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";

import { Button } from "./Button";
import { useDialogRef, Dialog } from "../shared";
import { InfoIcon } from "../../icons";

const ResponseDeliveryHelpDialog = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  const actions = (
    <>
      <Button
        className="ml-5"
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
      className="overflow-y-scroll max-h-[80%]"
      actions={actions}
    >
      <div className="p-5">
        <div className="mt-10">
          <h2>{t("settingsResponseDelivery.responseDeliveryHelp.title")}</h2>
          <p className="mb-4 text-sm">
            {t("settingsResponseDelivery.responseDeliveryHelp.description")}
          </p>
          <table className="mb-10">
            <thead className="border-b-3">
              <tr>
                <th className="text-left p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.title")}
                </th>
                <th className="text-left p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.title")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-sm border-b-2 border-r-2 p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text1")}
                </td>
                <td className="text-sm border-b-2 p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text1")}
                </td>
              </tr>
              <tr>
                <td className="text-sm border-b-2 border-r-2 p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text2")}
                </td>
                <td className="text-sm border-b-2 p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.vault.text2")}
                </td>
              </tr>
              <tr>
                <td className="text-sm border-b-2 border-r-2 p-2">
                  {t("settingsResponseDelivery.responseDeliveryHelp.inbox.text3")}
                </td>
                <td className="text-sm border-b-2 p-2"></td>
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
