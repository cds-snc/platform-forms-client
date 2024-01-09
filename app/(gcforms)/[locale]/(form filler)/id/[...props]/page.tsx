import { getPublicTemplateByID } from "@lib/templates";
import { serverTranslation } from "@i18n";
import classnames from "classnames";
import { Form, TextPage, ClosedPage, NextButton } from "@clientComponents/forms";
import { getRenderedForm } from "@lib/formBuilder";
import { dateHasPast } from "@lib/utils";
import { getLocalizedProperty } from "@lib/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FormDisplayLayout from "@clientComponents/globals/layouts/FormDisplayLayout";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";

export async function generateMetadata({
  params: { locale, props },
}: {
  params: { locale: string; props: string[] };
}): Promise<Metadata> {
  const formID = props[0];
  const publicForm = await getPublicTemplateByID(formID);
  if (!publicForm) return {};

  const formTitle = publicForm.form[getLocalizedProperty("title", locale)] as string;
  return {
    title: formTitle,
  };
}

export default async function Page({
  params: { locale, props },
}: {
  params: { locale: string; props: string[] };
}) {
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
  if (step === "confirmation") {
    return <TextPage formRecord={formRecord} />;
  }

  return (
    <FormDisplayLayout formRecord={formRecord}>
      <div className={classes}>
        <h1>{formTitle}</h1>
        <GCFormsProvider formRecord={formRecord}>
          <Form
            formRecord={formRecord}
            language={language}
            t={t}
            renderSubmit={({ validateForm, fallBack }) => {
              return <NextButton validateForm={validateForm} fallBack={fallBack} />;
            }}
          >
            {currentForm}
          </Form>
        </GCFormsProvider>
      </div>
    </FormDisplayLayout>
  );
}
