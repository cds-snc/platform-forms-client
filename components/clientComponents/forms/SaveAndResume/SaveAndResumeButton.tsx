import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";
import { SaveProgressIcon } from "@serverComponents/icons";

export const SaveAndResumeButton = ({ language }: { language: Language }) => {
  const { t } = useTranslation("review");
  const [confirm, setConfirm] = useState(false);

  return (
    <div>
      <DownloadProgress
        className="group bg-white"
        type="button"
        loading={confirm}
        theme="secondary"
        onClick={() => setConfirm(true)}
      >
        <>
          {t("saveAndResume.saveBtn", { lng: language })}
          <SaveProgressIcon className="ml-2 fill-gcds-blue-800 group-focus:fill-white group-active:fill-white" />
        </>
      </DownloadProgress>

      {confirm && (
        <ConfirmDownloadDialog
          type="progress"
          language={language}
          open={confirm}
          handleClose={() => setConfirm(false)}
        />
      )}
    </div>
  );
};
