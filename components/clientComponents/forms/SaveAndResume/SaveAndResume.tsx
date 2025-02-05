import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { type SecurityAttribute } from "@lib/types";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownload } from "./ConfirmDownload";

export const SaveAndResume = ({
  formId,
  formTitleEn,
  formTitleFr,
  securityAttribute,
  language,
}: {
  formId: string;
  formTitleEn: string;
  formTitleFr: string;
  securityAttribute: SecurityAttribute;
  language: Language;
}) => {
  const { t } = useTranslation(["review", "common"]);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="sticky bottom-0 z-50 mt-10 flex border-t-2 border-gcds-blue-900 bg-gcds-blue-100 p-4">
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
        securityAttribute={securityAttribute}
        language={language}
        open={confirm}
        handleClose={() => setConfirm(false)}
      />
    </div>
  );
};
