import { type Language } from "@lib/types/form-builder-types";
import { FormProperties } from "@lib/types";
import { SaveAndResume } from "@clientComponents/forms/SaveAndResume/SaveAndResume";
import { useTranslation } from "@root/i18n/client";

export const FormActions = ({
  children,
  language,
  saveAndResumeEnabled,
  formId,
  dirty,
}: {
  children: React.ReactNode;
  language: Language;
  saveAndResumeEnabled?: boolean;
  form: FormProperties;
  formId: string;
  dirty: boolean;
}) => {
  const { t } = useTranslation("form-builder");

  if (!saveAndResumeEnabled || !dirty) {
    return children;
  }

  return (
    <div
      className="border-gcds-blue-muted bg-gcds-blue-100 sticky bottom-0 -mx-5 mt-10 flex p-4"
      role="region"
      aria-label={t("formActions")}
    >
      <div className="flex w-full justify-between">
        {children}
        <SaveAndResume language={language as Language} formId={formId} />
      </div>
    </div>
  );
};
