import { type SecurityAttribute } from "@lib/types";
import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";

export const NextSteps = ({
  securityAttribute,
  language,
  host,
  formId,
}: {
  securityAttribute?: SecurityAttribute;
  language: Language;
  host: string;
  formId: string;
}) => {
  const { t } = customTranslate("common");
  const formLink = `${host}/${language}/id/${formId}/resume`;

  return (
    <>
      <div className="hidden">
        {securityAttribute && securityAttribute}
        {language && language}
        {formLink && formLink}
      </div>
      <div className="mb-10 rounded-lg bg-gcds-green-100 p-4">
        <h2 className="!mb-4 !text-2xl font-bold underline">
          {t("saveAndResume.downloadProgressHtml.nextSteps.title", { lng: language })}
        </h2>
        <div className="grid grid-cols-2 gap-28">
          <div>
            <div className="mb-4 rounded-lg border-2 border-slate-400 p-4">
              <h3 className="!mb-2 !text-2xl font-bold">
                {t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.title", {
                  lng: language,
                })}
              </h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: t("saveAndResume.downloadProgressHtml.nextSteps.resumeBox.description", {
                    lng: language,
                    formLink,
                    interpolation: {
                      escapeValue: false,
                    },
                  }),
                }}
              ></p>
            </div>
          </div>

          <div>
            <h3 className="!my-6 !text-2xl font-bold">
              {t("saveAndResume.downloadProgressHtml.keepSafe.title", { lng: language })}
            </h3>
            <p className="mb-20 max-w-56 italic">
              {t("saveAndResume.downloadProgressHtml.keepSafe.description", { lng: language })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
