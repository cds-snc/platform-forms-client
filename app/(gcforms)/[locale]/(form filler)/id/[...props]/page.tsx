import { getPublicTemplateByID, hasPublishedTemplateArchive } from "@lib/templates";
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
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { BackArrowIcon, ClosedFormIcon } from "@serverComponents/icons";
import { BrandProperties } from "@gcforms/types";
import { MaintenanceAvailabilityNotice } from "./MaintenanceAvailabilityNotice";

const TemporarilyUnavailablePage = ({
  language,
  title,
  message,
  backButtonLabel,
  formId,
  becameAvailableMessage,
  becameUnavailableMessage,
  reloadLabel,
  brand,
}: {
  language: "en" | "fr";
  title: string;
  message: string;
  backButtonLabel: string;
  formId: string;
  becameAvailableMessage: string;
  becameUnavailableMessage: string;
  reloadLabel: string;
  brand?: BrandProperties;
}) => {
  let homeHref = "https://canada.ca";

  if (brand?.urlEn && brand?.urlFr) {
    homeHref = language === "en" ? brand.urlEn : brand.urlFr;
  }

  return (
    <div className="gc-form-wrapper">
      <div className="mx-2 mb-36">
        <MaintenanceAvailabilityNotice
          formId={formId}
          initialAvailability={false}
          becameAvailableMessage={becameAvailableMessage}
          becameUnavailableMessage={becameUnavailableMessage}
          reloadLabel={reloadLabel}
        />
        <div className="mb-10 rounded-md border-1 border-blue-dark bg-gray-soft p-10">
          <ClosedFormIcon className="mr-5 mt-[-5px] inline-block" />
          <h1 tabIndex={-1} className="!mb-6 inline-block">
            {title}
          </h1>
          <p>{message}</p>
        </div>
        <LinkButton.Primary href={homeHref} className="mb-2 mr-3">
          <span>
            <BackArrowIcon className="mr-2 inline-block self-stretch fill-white" />
            {backButtonLabel}
          </span>
        </LinkButton.Primary>
      </div>
    </div>
  );
};

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
  const hasPublishedArchive = formRecord ? await hasPublishedTemplateArchive(formId) : false;
  const isTemporarilyUnavailable = Boolean(
    formRecord && !formRecord.isPublished && hasPublishedArchive
  );

  // 404 only when the form truly does not exist or has never been published.
  if (!formRecord || (!formRecord.isPublished && !hasPublishedArchive)) {
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

  const { t } = await serverTranslation("form-closed", { lang: language });

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
      {isTemporarilyUnavailable ? (
        <TemporarilyUnavailablePage
          language={language}
          title={t("temporarilyUnavailableTitle")}
          message={t("temporarilyUnavailableBody")}
          backButtonLabel={t("backButton")}
          formId={formId}
          becameAvailableMessage={t("temporarilyUnavailableAvailableMessage")}
          becameUnavailableMessage={t("temporarilyUnavailableUnavailableMessage")}
          reloadLabel={t("temporarilyUnavailableReload")}
          brand={formRecord.form.brand}
        />
      ) : (
        <GCFormsProvider formRecord={formRecord} nonce={nonce}>
          <MaintenanceAvailabilityNotice
            formId={formId}
            initialAvailability={true}
            becameAvailableMessage={t("temporarilyUnavailableAvailableMessage")}
            becameUnavailableMessage={t("temporarilyUnavailableUnavailableMessage")}
            reloadLabel={t("temporarilyUnavailableReload")}
            unavailableRedirectUrl={`/${language}/id/${formId}`}
          />
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
      )}
    </FormDisplayLayout>
  );
}
