import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownload } from "./ConfirmDownload";
import { SaveProgressIcon } from "@serverComponents/icons/SaveProgressIcon";

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
        className="group mr-4"
        type="button"
        loading={confirm}
        theme="secondary"
        onClick={() => setConfirm(true)}
      >
        <>
          <span className="hidden tablet:block">
            {t("saveAndResume.saveBtn", { lng: language })}
          </span>
          <span className="block tablet:hidden">
            <SaveProgressIcon
              className="fill-[#2B4380] group-focus:fill-white group-active:fill-white"
              title={t("saveAndResume.saveBtn", { lng: language })}
            />
          </span>
        </>
      </DownloadProgress>
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
