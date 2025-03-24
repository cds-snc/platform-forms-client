import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";
import { MobileDrawer } from "./MobileDrawer";
import { Button } from "@clientComponents/globals";

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
        <Button
          className="group bg-white"
          type="button"
          theme="secondary"
          onClick={() => setDrawerOpen(true)}
        >
          <>{t("saveResponse.more")}...</>
        </Button>
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
      <MobileDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        formId={formId}
        language={language}
        formTitleEn={formTitleEn}
        formTitleFr={formTitleFr}
        type="progress"
      />
    </div>
  );
};
