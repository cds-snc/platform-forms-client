import { getPublicTemplateByID } from "@lib/templates";
import { dateHasPast } from "@lib/utils";
import { getLocalizedProperty } from "@lib/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FormDisplayLayout from "@clientComponents/globals/layouts/FormDisplayLayout";
import { GCFormsProvider } from "@lib/hooks/useGCFormContext";
import { PageContent } from "./pageContent";
import { allowGrouping } from "@lib/groups/utils/allowGrouping";
import { serverTranslation } from "@i18n";
import { headers } from "next/headers";
import { Footer } from "@serverComponents/globals/Footer";

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
  const nonce = (await headers()).get("x-nonce") ?? "";
  const pathname = (await headers()).get("x-path") ?? "";
  const params = await props0.params;

  const { locale, props } = params;

  const formId = props[0];
  const step = props[1] ?? "";
  const formRecord = await getPublicTemplateByID(formId);

  // Redirect if form doesn't exist and only retrieve published forms
  if (!formRecord || !formRecord?.isPublished) {
    notFound();
  }

  // undefined will throw a serialization error in which case delete the key as it's uneeded
  if (typeof formRecord.closingDate === "undefined") {
    delete formRecord.closingDate;
  }

  const language = locale as "en" | "fr";
  const formTitle = formRecord.form[getLocalizedProperty("title", language)] as string;
  const isAllowGrouping = allowGrouping();

  let isPastClosingDate = false;
  if (formRecord.closingDate) {
    isPastClosingDate = dateHasPast(Date.parse(formRecord.closingDate));
  }

  const saveAndResume = formRecord?.saveAndResume || false;

  const footer = (
    <Footer className="mt-4" disableGcBranding={formRecord?.form.brand?.disableGcBranding} />
  );

  return (
    <FormDisplayLayout
      pathname={pathname}
      language={language}
      formRecord={formRecord}
      isPastClosingDate={isPastClosingDate}
      step={step}
      saveAndResume={saveAndResume}
      footer={footer}
    >
      <GCFormsProvider formRecord={formRecord} nonce={nonce}>
        <PageContent
          formRecord={formRecord}
          language={language}
          formTitle={formTitle}
          isPastClosingDate={isPastClosingDate}
          step={step}
          formId={formId}
          saveAndResume={saveAndResume}
          isAllowGrouping={isAllowGrouping}
        />
      </GCFormsProvider>
    </FormDisplayLayout>
  );
}
