import { useState } from "react";
import { useTranslation } from "@i18n/client";

import { type Language } from "@lib/types/form-builder-types";
import { SubmitButton as DownloadProgress } from "@clientComponents/globals/Buttons/SubmitButton";
import { ConfirmDownloadDialog } from "./ConfirmDownloadDialog";
import { MobileDrawer } from "./MobileDrawer";
import { Button } from "@clientComponents/globals";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { SaveProgressIcon } from "@serverComponents/icons";
import { UploadIcon } from "@serverComponents/icons";

export const SaveAndResume = ({ formId, language }: { formId: string; language: Language }) => {
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
          <>
            {t("saveAndResume.saveBtn", { lng: language })}
            <SaveProgressIcon className="ml-2 fill-gcds-blue-800 group-focus:fill-white group-active:fill-white" />
          </>
        </DownloadProgress>
        <div className="group inline-block">
          <LinkButton.Secondary
            className="ml-4 rounded-md"
            href={`/${language}/id/${formId}/resume`}
          >
            <>
              {t("saveAndResume.loadAnswers", { lng: language })}
              <UploadIcon className="ml-2 fill-gcds-blue-800 group-focus:fill-white group-active:fill-white" />
            </>
          </LinkButton.Secondary>
        </div>
      </span>
      <span className="block tablet:hidden">
        <Button
          className="group bg-white"
          type="button"
          theme="secondary"
          onClick={() => setDrawerOpen(true)}
        >
          <>{t("saveAndResume.more")}...</>
        </Button>
      </span>
      <ConfirmDownloadDialog
        type="progress"
        language={language}
        open={confirm}
        handleClose={() => setConfirm(false)}
      />
      <MobileDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        formId={formId}
        language={language}
        type="progress"
      />
    </div>
  );
};
