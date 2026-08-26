import Drawer from "./Drawer";
import { Close } from "@serverComponents/icons/Close";
import { SaveProgressIcon, UploadIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { Language } from "@lib/types/form-builder-types";
import { generateResponseProgressHtml } from "@lib/saveAndResume/generateResponseProgressHtml";
import { downloadDataAsBlob } from "@lib/downloadDataAsBlob";
import { useTranslation } from "@i18n/client";
import { useFormSubmissionData } from "@lib/hooks/useFormSubmissionData";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { useCallback } from "react";
import { logMessage } from "@lib/logger";
import { toast } from "@formBuilder/components/shared/Toast";

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
  const { t } = useTranslation(["common", "form-builder"]);

  const generateHtmlError = t("saveResponse.downloadHtml.generateHtmlError.description", {
    lng: language,
    ns: "common",
  });

  const { fileName, getOptions } = useFormSubmissionData({ language, type });

  const handleSave = useCallback(async () => {
    if (!drawerOpen) return;

    try {
      const html = await generateResponseProgressHtml(getOptions());

      if (!html.data || html.data === "") {
        throw new Error("Error generating download progress html");
      }

      await downloadDataAsBlob(html.data, fileName, { "text/html": [".html"] });
      setDrawerOpen(false);
    } catch (error) {
      logMessage.error(error);
      toast.error(generateHtmlError, "public-facing-form");
    }
  }, [drawerOpen, fileName, generateHtmlError, getOptions, setDrawerOpen]);

  return (
    <Drawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Button
        theme="link"
        className="group absolute top-0 right-0 z-1000 mt-4 mr-4"
        aria-label={t("close")}
        onClick={() => setDrawerOpen(false)}
        dataTestId="close-dialog"
      >
        <span className="block">
          <Close className="group-focus:fill-white-default inline-block" />
        </span>
      </Button>
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
    </Drawer>
  );
};
