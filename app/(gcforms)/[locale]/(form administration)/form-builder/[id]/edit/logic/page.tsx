import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { FlowWithProvider } from "./components/flow/FlowWithProvider";
import { Suspense } from "react";
import { Loader } from "@clientComponents/globals/Loader";
import { LogicNavigation } from "./components/LogicNavigation";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";
import { Legend } from "./components/flow/Legend";
import { Language } from "@lib/types/form-builder-types";
import { EndMarker } from "./components/flow/EndMarker";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page(
  props: {
    params: Promise<{ id: string; locale: string }>;
  }
) {
  const params = await props.params;

  const {
    id,
    locale
  } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  const Loading = () => (
    <div className="flex h-full items-center justify-center ">
      <Loader />
    </div>
  );
  return (
    <div id={id}>
      <h1 className="sr-only">{t("edit")}</h1>
      <h2 className="mb-4 border-0" id="logicTitle" tabIndex={-1}>
        {t("logic.heading")}
      </h2>
      <SkipLinkReusable anchor="#rightPanelTitle">{t("skipLink.logicSetup")}</SkipLinkReusable>
      <Legend lang={locale as Language} />
      <LogicNavigation />
      <div className="flow-container my-4 w-full border-1">
        <Suspense fallback={<Loading />}>
          <>
            <EndMarker />
            <FlowWithProvider lang={locale as Language} />
          </>
        </Suspense>
      </div>
      <SkipLinkReusable anchor="#rightPanelTitle">{t("skipLink.logicSetup")}</SkipLinkReusable>
    </div>
  );
}
