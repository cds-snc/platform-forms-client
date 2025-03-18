import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";
import Drawer from "react-bottom-drawer";
import { SaveProgressIcon, UploadIcon } from "@serverComponents/icons";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <span className="hidden tablet:block">
        <DownloadProgress
          className="group bg-white"
          type="button"
          loading={confirm}
          theme="secondary"
          onClick={() => setConfirm(true)}
        >
          <>{t("saveAndResume.saveBtn", { lng: language })}</>
        </DownloadProgress>
      </span>
      <span className="block tablet:hidden">
        <DownloadProgress
          className="group bg-white"
          type="button"
          loading={confirm}
          theme="secondary"
          onClick={() => setDrawerOpen(true)}
        >
          <>More...</>
        </DownloadProgress>
      </span>
      <ConfirmDownloadDialog
        type="progress"
        formId={formId}
        formTitleEn={formTitleEn}
        formTitleFr={formTitleFr}
        language={language}
        open={confirm}
        handleClose={() => setConfirm(false)}
      />
      <Drawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)} className="">
        <h2>More</h2>
        <div className="flex flex-col gap-4">
          <button className="flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4">
            <SaveProgressIcon className="mr-4 size-8" />
            Save to device
          </button>
          <button className="flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4">
            <UploadIcon className="mr-4 size-8" />
            Load answers
          </button>
        </div>
        <p className="my-6 px-4">
          Protect your data by keeping the downloaded file in a safe place on a trusted device.
        </p>

        <div className="sticky bottom-0 border-gcds-blue-900 bg-gcds-blue-100 p-4">
          <DownloadProgress
            className="group rounded-full bg-white"
            type="button"
            loading={confirm}
            theme="secondary"
            onClick={() => setDrawerOpen(false)}
          >
            <>Cancel</>
          </DownloadProgress>
        </div>
      </Drawer>
    </div>
  );
};
