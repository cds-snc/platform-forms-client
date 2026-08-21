import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";
import { SaveProgressIcon } from "@serverComponents/icons";
import { useFormikContext } from "formik";
import { useGCFormsContext } from "@root/lib/hooks/useGCFormContext";

export const SaveAndResumeButton = ({ language }: { language: Language }) => {
  const { t } = useTranslation("review");
  const [confirm, setConfirm] = useState(false);

  const { values } = useFormikContext();
  const { updateVisibleElementIds } = useGCFormsContext();

  return (
    <div>
      <DownloadProgress
        className="group bg-white"
        type="button"
        loading={confirm}
        theme="secondary"
        onClick={() => {
          updateVisibleElementIds(values as Record<string, string>);
          setConfirm(true);
        }}
      >
        <>
          {t("saveAndResume.saveBtn", { lng: language })}
          <SaveProgressIcon className="fill-gcds-blue-800 ml-2 group-focus:fill-white group-active:fill-white" />
        </>
      </DownloadProgress>

      {confirm && (
        <ConfirmDownloadDialog
          type="progress"
          language={language}
          open={confirm}
          handleClose={() => {
            updateVisibleElementIds(values as Record<string, string>);
            setConfirm(false);
          }}
        />
      )}
    </div>
  );
};
