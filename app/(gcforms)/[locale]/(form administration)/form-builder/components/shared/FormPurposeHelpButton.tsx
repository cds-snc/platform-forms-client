"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useDialogRef, Dialog } from ".";
import { InfoIcon } from "@serverComponents/icons";

import Markdown from "markdown-to-jsx";

const FormPurposeHelpDialog = ({ handleClose }: { handleClose: () => void }) => {
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
      title={t("settingsPurposeAndUse.learnMoreBox.title")}
    >
      <div className="p-5">
        <div className="mt-0">
          <p className="mb-6 text-sm">
            <Markdown options={{ forceBlock: true }}>
              {t("settingsPurposeAndUse.learnMoreBox.description")}
            </Markdown>
          </p>
          <div className="mb-8">
            <div className="mb-6">
              <strong>{t("settingsPurposeAndUse.learnMoreBox.personalInfo")}</strong>
            </div>
            <ul>
              <Markdown options={{ forceBlock: true }}>
                {t("settingsPurposeAndUse.learnMoreBox.personalInfoList")}
              </Markdown>
            </ul>
          </div>
          <div className="mb-8">
            <div className="mb-6">
              <strong>{t("settingsPurposeAndUse.learnMoreBox.nonAdminInfo")}</strong>
            </div>
            <ul>
              <Markdown options={{ forceBlock: true }}>
                {t("settingsPurposeAndUse.learnMoreBox.nonAdminInfoList")}
              </Markdown>
            </ul>
          </div>
          <div>
            <Markdown options={{ forceBlock: true }}>
              {t("settingsPurposeAndUse.learnMoreBox.contactCoordinator")}
            </Markdown>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export const FormPurposeHelpButton = () => {
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
          {t("settingsPurposeAndUse.learnMore")}
        </Button>
        {downloadDialog && <FormPurposeHelpDialog handleClose={handleCloseDialog} />}
      </div>
    </>
  );
};
