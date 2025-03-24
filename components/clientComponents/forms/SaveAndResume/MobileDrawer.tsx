import Drawer from "react-bottom-drawer";
import { SaveProgressIcon, UploadIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import Link from "next/link";
import { Language } from "@lib/types/form-builder-types";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormValues } from "@lib/formContext";
import { getReviewItems } from "../Review/helpers";
import { slugify } from "@lib/client/clientHelpers";
import { getStartLabels } from "@lib/utils/form-builder/i18nHelpers";
import { generateDownloadHtml } from "@lib/saveAndResume/actions";
import { downloadDataAsBlob } from "@lib/downloadDataAsBlob";
import { useTranslation } from "@i18n/client";

export const MobileDrawer = ({
  drawerOpen,
  setDrawerOpen,
  formId,
  language,
  formTitleEn,
  formTitleFr,
  type,
}: {
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formId: string;
  language: Language;
  formTitleEn: string;
  formTitleFr: string;
  type: "confirm" | "progress";
}) => {
  const { t } = useTranslation("common");

  const {
    groups,
    getValues,
    formRecord,
    getGroupHistory,
    matchedIds,
    getProgressData,
    submissionId,
    submissionDate,
  } = useGCFormsContext();

  const formValues: void | FormValues = getValues();
  const groupHistoryIds = getGroupHistory();
  if (!formValues || !groups) throw new Error("Form values or groups are missing");

  const reviewItems = getReviewItems({
    formElements: formRecord.form.elements,
    formValues,
    groups,
    groupHistoryIds,
    matchedIds,
    language,
  });

  const handleSave = async () => {
    const title = language === "en" ? formTitleEn : formTitleFr;

    const fileName = `${slugify(title)}-${formId}.html`;

    const options = {
      formTitle: title,
      type,
      formId,
      reviewItems,
      formResponse: Buffer.from(JSON.stringify(getProgressData()), "utf8").toString("base64"),
      language,
      startSectionTitle: getStartLabels()[language],
      submissionId,
      submissionDate,
    };

    const html = await generateDownloadHtml(options);

    await downloadDataAsBlob(html.data, fileName, { "text/html": [".html"] });

    setDrawerOpen(false);
  };

  return (
    <Drawer isVisible={drawerOpen} onClose={() => setDrawerOpen(false)} className="">
      <h2>{t("saveResponse.more")}</h2>
      <div className="flex flex-col gap-4">
        <Button
          theme="secondary"
          className="flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4"
          onClick={handleSave}
        >
          <>
            <SaveProgressIcon className="mr-4 size-8" />
            {t("saveResponse.saveToDevice")}
          </>
        </Button>
        <Link
          href={`/${language}/id/${formId}/resume`}
          className="flex w-full items-center justify-center rounded-full border border-slate-900 bg-slate-100 py-4 no-underline"
        >
          <>
            <UploadIcon className="mr-4 size-8" />
            {t("saveResponse.resumeForm")}
          </>
        </Link>
      </div>
      <p className="my-6 px-4">{t("saveResponse.protectYourDataNote")}</p>

      <div className="sticky bottom-0 -mx-3 border-2 border-t-gcds-blue-900 bg-gcds-blue-100 p-4">
        <Button
          theme="secondary"
          className="rounded-full bg-white"
          onClick={() => setDrawerOpen(false)}
        >
          {t("saveResponse.cancel")}
        </Button>
      </div>
    </Drawer>
  );
};
