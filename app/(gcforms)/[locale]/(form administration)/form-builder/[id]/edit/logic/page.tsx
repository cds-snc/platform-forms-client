import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";
import { FlowWithProvider } from "./components/flow/FlowWithProvider";
import { Suspense } from "react";
import { Loader } from "@clientComponents/globals/Loader";
import { LogicNavigation } from "./components/LogicNavigation";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const allowGroups = await allowGrouping();

  if (!allowGroups) {
    return null;
  }

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
      <p>{t("logic.description")}</p>
      <LogicNavigation />
      <div className="my-10 w-full border-1" style={{ height: "calc(100vh - 300px)" }}>
        <Suspense fallback={<Loading />}>
          <FlowWithProvider />
        </Suspense>
      </div>
      <SkipLinkReusable anchor="#rightPanelTitle">{t("skipLink.logicSetup")}</SkipLinkReusable>
    </div>
  );
}
