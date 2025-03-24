"use client";

import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadConfirm } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";

export const SaveResponse = ({
  formId,
  formTitleEn,
  formTitleFr,
  language,
}: {
  formId: string;
  formTitleEn: string;
  formTitleFr: string;
  language: Language;
}) => {
  const { t } = useTranslation(["review", "common"]);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="mr-4 inline-block max-w-fit rounded-lg bg-gcds-green-100 px-4 py-2">
      <div className="mb-4 mr-4 inline-block">
        {t("saveResponse.saveBtnDescription", { lng: language })}
      </div>
      <DownloadConfirm
        className="group"
        type="button"
        loading={confirm}
        theme="primary"
        onClick={() => setConfirm(true)}
      >
        <span>{t("saveResponse.saveBtn", { lng: language })}</span>
      </DownloadConfirm>
      <ConfirmDownloadDialog
        type="confirm"
        formId={formId}
        formTitleEn={formTitleEn}
        formTitleFr={formTitleFr}
        language={language}
        open={confirm}
        handleClose={() => setConfirm(false)}
      />
    </div>
  );
};
