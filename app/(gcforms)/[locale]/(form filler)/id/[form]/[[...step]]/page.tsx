import { getPublicTemplateByID } from "@lib/templates";
import { serverTranslation } from "@i18n";
import classnames from "classnames";
import { Form, TextPage, ClosedPage } from "@clientComponents/forms";
import { getRenderedForm } from "@lib/formBuilder";
import { dateHasPast } from "@lib/utils";
import { getLocalizedProperty } from "@lib/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FormDisplayLayout from "@clientComponents/globals/layouts/FormDisplayLayout";

export async function generateMetadata({
  params: { locale, form },
}: {
  params: { locale: string; form: string };
}): Promise<Metadata> {
  const publicForm = await getPublicTemplateByID(form);
  if (!publicForm) return {};

  const formTitle = publicForm.form[getLocalizedProperty("title", locale)] as string;
  return {
    title: formTitle,
  };
}

export default async function Page({
  params: { locale, step, form: formID },
}: {
  params: { locale: string; step?: string[]; form: string };
}) {
  const formRecord = await getPublicTemplateByID(formID);

  // Redirect if form doesn't exist and only retrieve published forms
  if (!formRecord || !formRecord?.isPublished) {
    notFound();
  }

  // undefined will throw a serialization error in which case delete the key as it's uneeded
  if (typeof formRecord.closingDate === "undefined") {
    delete formRecord.closingDate;
  }

  const { t } = await serverTranslation(["common", "welcome", "confirmation", "form-closed"], {
    lang: locale,
  });
  const language = locale as "en" | "fr";
  const classes = classnames("gc-form-wrapper");
  const currentForm = getRenderedForm(formRecord, language, t);
  const formTitle = formRecord.form[getLocalizedProperty("title", language)] as string;

  let isPastClosingDate = false;

  if (formRecord.closingDate) {
    isPastClosingDate = dateHasPast(Date.parse(formRecord.closingDate));
  }

  if (isPastClosingDate) {
    return <ClosedPage language={language} formRecord={formRecord} />;
  }

  // render text pages
  if (step?.[0] === "confirmation") {
    return <TextPage formRecord={formRecord} />;
  }

  return (
    <FormDisplayLayout formRecord={formRecord}>
      <div className={classes}>
        <h1>{formTitle}</h1>
        <Form formRecord={formRecord} language={language} t={t}>
          {currentForm}
        </Form>
      </div>
    </FormDisplayLayout>
  );
}
