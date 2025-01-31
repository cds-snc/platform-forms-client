import { getPublicTemplateByID } from "@lib/templates";
import { cn } from "@lib/utils";
import { TextPage, ClosedPage } from "@clientComponents/forms";
import { getRenderedForm } from "@lib/formBuilder";
import { dateHasPast } from "@lib/utils";
import { getLocalizedProperty } from "@lib/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FormDisplayLayout from "@clientComponents/globals/layouts/FormDisplayLayout";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";
import { FormWrapper } from "./clientSide";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { serverTranslation } from "@i18n";
import { ClosingNotice } from "@clientComponents/forms/ClosingNotice/ClosingNotice";
import { FormDelayProvider } from "@lib/hooks/useFormDelayContext";
import { ResumeForm } from "@clientComponents/forms/ResumeForm/ResumeForm";

export async function generateMetadata(props0: {
  params: Promise<{ locale: string; props: string[] }>;
}): Promise<Metadata> {
  const params = await props0.params;

  const { locale, props } = params;

  const formID = props[0];
  const step = props[1] ?? "";
  const publicForm = await getPublicTemplateByID(formID);
  if (!publicForm) return {};

  const { t } = await serverTranslation(["form-builder"], { lang: locale });

  // Update the browser title so AT users know they are on the confirmation page
  const title = `${step === "confirmation" ? t("confirmationPage") + ": " : ""}${
    publicForm.form[getLocalizedProperty("title", locale)]
  }`;

  return {
    title,
  };
}

export default async function Page(props0: {
  params: Promise<{ locale: string; props: string[] }>;
}) {
  const params = await props0.params;

  const { locale, props } = params;

  const formID = props[0];
  const step = props[1] ?? "";

  const formRecord = await getPublicTemplateByID(formID);

  // Redirect if form doesn't exist and only retrieve published forms
  if (!formRecord || !formRecord?.isPublished) {
    notFound();
  }

  // undefined will throw a serialization error in which case delete the key as it's uneeded
  if (typeof formRecord.closingDate === "undefined") {
    delete formRecord.closingDate;
  }

  const language = locale as "en" | "fr";
  const classes = cn("gc-form-wrapper");
  const currentForm = getRenderedForm(formRecord, language);
  const formTitle = formRecord.form[getLocalizedProperty("title", language)] as string;
  const isAllowGrouping = allowGrouping();

  let isPastClosingDate = false;

  if (formRecord.closingDate) {
    isPastClosingDate = dateHasPast(Date.parse(formRecord.closingDate));
  }

  if (isPastClosingDate) {
    return (
      <FormDisplayLayout formRecord={formRecord}>
        <ClosedPage language={language} formRecord={formRecord} />
      </FormDisplayLayout>
    );
  }

  if (step === "resume") {
    return (
      <FormDisplayLayout formRecord={formRecord}>
        <ResumeForm formId={formID} />
      </FormDisplayLayout>
    );
  }

  // render text pages
  if (step === "confirmation") {
    return (
      <FormDisplayLayout formRecord={formRecord}>
        <div className={classes}>
          <TextPage formRecord={formRecord} />
        </div>
      </FormDisplayLayout>
    );
  }

  return (
    <FormDisplayLayout formRecord={formRecord}>
      <div className={classes}>
        <ClosingNotice language={language} closingDate={formRecord.closingDate} />
        <h1>{formTitle}</h1>
        <GCFormsProvider formRecord={formRecord}>
          <FormDelayProvider>
            <FormWrapper
              formRecord={formRecord}
              currentForm={currentForm}
              allowGrouping={isAllowGrouping}
            />
          </FormDelayProvider>
        </GCFormsProvider>
      </div>
    </FormDisplayLayout>
  );
}
