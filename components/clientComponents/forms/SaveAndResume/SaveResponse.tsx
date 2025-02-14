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
  submissionId,
}: {
  formId: string;
  formTitleEn: string;
  formTitleFr: string;
  language: Language;
  submissionId?: string;
}) => {
  const { t } = useTranslation(["review", "common"]);
  const [confirm, setConfirm] = useState(false);

  return (
    <div>
      <DownloadConfirm
        className="group"
        type="button"
        loading={confirm}
        theme="secondary"
        onClick={() => setConfirm(true)}
      >
        <>
          <span>{t("saveResponse.saveBtn", { lng: language })}</span>
        </>
      </DownloadConfirm>
      <ConfirmDownloadDialog
        type="confirm"
        submissionId={submissionId}
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
