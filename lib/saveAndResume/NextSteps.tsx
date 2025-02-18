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
      <div className="mb-10 rounded-lg bg-violet-50 p-4">
        <h2 className="!mb-4 !text-2xl font-bold underline">
          {t("saveAndResume.downloadProgressHtml.nextSteps.title", { lng: language })}
        </h2>
        <div className="grid grid-cols-2 gap-4 tablet:gap-28">
          <div>
            <a
              href={formLink}
              className="mb-4 block rounded-lg border-2 border-slate-400 p-4 !no-underline"
            >
              <h3 className="!mb-2 !text-2xl font-bold">
                {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.title", {
                  lng: language,
                })}
              </h3>
              <p>{t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.description")}</p>
            </a>
          </div>
          <div>
            <h3 className="!my-6 !text-2xl font-bold">
              {t("saveAndResume.downloadProgressHtml.keepSafe.title", { lng: language })}
            </h3>
            <p className="mb-6 max-w-56 italic">
              {t("saveAndResume.downloadProgressHtml.keepSafe.description", { lng: language })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
