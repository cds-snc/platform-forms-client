import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";

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
    <>
      <div className="mb-10 rounded-lg border-1 border-blue bg-violet-50 p-4">
        <h2 className="!mb-4 !text-xl font-bold">
          {t("saveAndResume.downloadProgressHtml.nextSteps.title", { lng: language })}
        </h2>
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
          <a href={formLink} className="!text-2xl font-bold underline">
            {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.link", {
              lng: language,
            })}
          </a>
        </div>
      </div>
      {/* Keep this info safe */}
      <div>
        <h3 className="!my-2 !text-xl font-bold">
          {t("saveAndResume.downloadProgressHtml.keepSafe.title", { lng: language })}
        </h3>
        <p className="mb-6 italic">
          {t("saveAndResume.downloadProgressHtml.keepSafe.description", { lng: language })}
        </p>
      </div>
    </>
  );
};
