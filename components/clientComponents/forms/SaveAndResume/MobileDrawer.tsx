import Drawer from "./Drawer";
import { SaveProgressIcon, UploadIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { Language } from "@lib/types/form-builder-types";
import { generateDownloadHtml } from "@lib/saveAndResume/actions";
import { downloadDataAsBlob } from "@lib/downloadDataAsBlob";
import { useTranslation } from "@i18n/client";
import { useFormSubmissionData } from "@lib/hooks/useFormSubmissionData";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useCallback } from "react";

export const MobileDrawer = ({
  drawerOpen,
  setDrawerOpen,
  formId,
  language,
  type,
}: {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formId: string;
  language: Language;
  type: "confirm" | "progress";
}) => {
  const { t } = useTranslation("common");

  const { fileName, getOptions } = useFormSubmissionData({ language, type });

  const handleSave = useCallback(async () => {
    if (!drawerOpen) return;

    const html = await generateDownloadHtml(getOptions());
    await downloadDataAsBlob(html.data, fileName, { "text/html": [".html"] });
    setDrawerOpen(false);
  }, [getOptions, fileName, setDrawerOpen, drawerOpen]);

  return (
    <Drawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <h2>{t("saveAndResume.more")}</h2>
      <div className="mx-4 flex flex-col gap-4">
        <Button
          theme="secondary"
          className="group flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4"
          onClick={handleSave}
        >
          <>
            <SaveProgressIcon className="mr-4 size-8 group-focus:fill-white" />
            {t("saveAndResume.saveToDevice")}
          </>
        </Button>
        <LinkButton.Secondary
          href={`/${language}/id/${formId}/resume`}
          className="group flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4"
        >
          <>
            <UploadIcon className="mr-4 size-8 group-focus:fill-white" />
            {t("saveAndResume.resumeForm")}
          </>
        </LinkButton.Secondary>
      </div>
      <p className="my-6 px-4">{t("saveAndResume.protectYourDataNote")}</p>

      <div className="sticky bottom-0 -mx-2 border-2 border-t-gcds-blue-900 bg-gcds-blue-100 p-4">
        <Button
          theme="secondary"
          className="rounded-full bg-white"
          onClick={() => setDrawerOpen(false)}
        >
          {t("saveAndResume.cancel")}
        </Button>
      </div>
    </Drawer>
  );
};
