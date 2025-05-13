import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";
import { LightBulbIcon } from "@serverComponents/icons/LightBulbIcon";

export const NextSteps = ({
  language,
  host,
  formId,
}: {
  language: Language;
  host: string;
  formId: string;
}) => {
  const { t } = customTranslate("common");
  const formLink = `${host}/${language}/id/${formId}/resume`;

  return (
    <div className="flex w-full flex-row">
      <div className="w-1/3">
        <div className="mb-4 rounded-lg border-2 border-slate-400 bg-violet-50 p-4">
          <div className="mb-2 text-xl font-bold">
            {t("saveAndResume.downloadProgressHtml.nextSteps.title", { lng: language })}
          </div>
          <div className="!mb-2">
            <p>
              {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.title", {
                lng: language,
              })}
            </p>
            <p>
              {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.text1", {
                lng: language,
              })}
            </p>
            <p>
              {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.text2", {
                lng: language,
              })}
            </p>
            <p>
              {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.text3", {
                lng: language,
              })}
            </p>
            <p className="mb-4">
              {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.text4", {
                lng: language,
              })}
            </p>
            <a href={formLink} className="text-xl font-bold underline">
              {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.link", {
                lng: language,
              })}
            </a>
          </div>
        </div>
        {/* Keep this info safe */}
        <div className="mb-3">
          <div>
            <LightBulbIcon className="-mt-2 mr-2 inline-block" />
            <h3 className="!my-0 mb-0 inline-block !text-xl font-bold">
              {t("saveAndResume.downloadProgressHtml.keepSafe.title", { lng: language })}
            </h3>
          </div>
          <p className="m-0 ml-8 italic">
            {t("saveAndResume.downloadProgressHtml.keepSafe.description", { lng: language })}
          </p>
        </div>
      </div>
    </div>
  );
};
