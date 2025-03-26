import { type Language } from "@lib/types/form-builder-types";
import { FormProperties } from "@lib/types";
import { SaveAndResume } from "@clientComponents/forms/SaveAndResume/SaveAndResume";

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
  if (!saveAndResumeEnabled || !dirty) {
    return children;
  }

  return (
    <div className="sticky bottom-0 -mx-5 mt-10 flex border-gcds-blue-900 bg-gcds-blue-100 p-4">
      <div className="flex w-full justify-between">
        {children}
        <SaveAndResume language={language as Language} formId={formId} />
      </div>
    </div>
  );
};
