import { useTranslation } from "@i18n/client";
import { LightBulbIcon } from "@serverComponents/icons/LightBulbIcon";

export const Instructions = () => {
  const { t } = useTranslation(["form-builder", "common"]);
  return (
    <div className="mb-6 flex border-b-1 border-slate-500 p-2">
      <LightBulbIcon className="mr-2 mt-[-2]" />
      <div>
        <div className="mb-2 p-0 !text-xl">
          {t("saveAndResume.resumePage.readyToContinue.title")}
        </div>
        <p className="mb-2 text-sm">{t("saveAndResume.resumePage.readyToContinue.intro")}</p>
        <p className="text-sm">{t("saveAndResume.resumePage.readyToContinue.text1")}</p>
        <p className="text-sm">{t("saveAndResume.resumePage.readyToContinue.text2")}</p>
        <p className="mb-10 text-sm">{t("saveAndResume.resumePage.readyToContinue.text3")}</p>
      </div>
    </div>
  );
};
