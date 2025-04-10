"use client";

import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadConfirm } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";
import { DownloadSubmissionIcon } from "@serverComponents/icons/DownloadSubmissionIcon";

export const SaveResponse = ({ language }: { language: Language }) => {
  const { t } = useTranslation(["review", "common"]);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="mr-4 inline-block max-w-fit rounded-lg bg-gcds-green-100 px-4 py-2">
      <div className="mb-4 mr-4 inline-block font-bold">
        {t("saveResponse.saveBtnDescription", { lng: language })}
      </div>
      <DownloadConfirm
        className="group inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-medium "
        type="button"
        loading={confirm}
        theme="primary"
        onClick={() => setConfirm(true)}
      >
        <>
          <span className="mr-2 inline-block text-xl">
            {t("saveResponse.saveBtn", { lng: language })}
          </span>
          <DownloadSubmissionIcon className=" fill-white " />
        </>
      </DownloadConfirm>
      <ConfirmDownloadDialog
        type="confirm"
        language={language}
        open={confirm}
        handleClose={() => setConfirm(false)}
      />
    </div>
  );
};
