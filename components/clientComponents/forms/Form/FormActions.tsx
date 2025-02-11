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
  saveAndResumeEnabled?: boolean;
  form: FormProperties;
  formId: string;
  dirty: boolean;
}) => {
  if (!saveAndResumeEnabled || !dirty) {
    return children;
  }

  return (
    <div className="sticky bottom-0 mt-10 flex  border-gcds-blue-900 bg-gcds-blue-100 py-4 before:absolute before:inset-0 before:left-[-100vw] before:-z-10 before:border-t-3 before:border-gcds-blue-900 before:bg-gcds-blue-100 after:absolute after:inset-0 after:right-[-100vw] after:-z-10 after:border-t-3 after:border-gcds-blue-900 after:bg-gcds-blue-100">
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
