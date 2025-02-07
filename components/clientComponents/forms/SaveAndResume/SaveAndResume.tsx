import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownload } from "./ConfirmDownload";

export const SaveAndResume = ({
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
    <div>
      <DownloadProgress
        className="mr-4"
        type="button"
        loading={confirm}
        theme="secondary"
        onClick={() => setConfirm(true)}
      >
        {t("saveAndResume.saveBtn")}
      </DownloadProgress>
      <LinkButton.Secondary href={`/${language}/id/${formId}/resume`}>
        {t("saveAndResume.resumeBtn")}
      </LinkButton.Secondary>
      <ConfirmDownload
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
