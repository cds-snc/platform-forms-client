import { type Language } from "@lib/types/form-builder-types";
import { FormProperties } from "@lib/types";
import { SaveAndResume } from "@clientComponents/forms/SaveAndResume/SaveAndResume";

export const FormActions = ({
  children,
  language,
  saveAndResumeEnabled,
  form,
  formId,
  dirty,
}: {
  children: React.ReactNode;
  language: Language;
  saveAndResumeEnabled: boolean;
  form: FormProperties;
  formId: string;
  dirty: boolean;
}) => {
  if (!saveAndResumeEnabled || !dirty) {
    return children;
  }

  return (
    <div className="sticky bottom-0 z-50 mt-10 flex border-t-2 border-gcds-blue-900 bg-gcds-blue-100 p-4">
      <div className="flex w-full justify-between">
        {children}
        <SaveAndResume
          formTitleEn={form.titleEn}
          formTitleFr={form.titleFr}
          language={language as Language}
          formId={formId}
        />
      </div>
    </div>
  );
};
