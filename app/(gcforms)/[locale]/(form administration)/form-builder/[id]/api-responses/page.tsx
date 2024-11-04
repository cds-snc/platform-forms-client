import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { getAppSetting } from "@lib/appSettings";
import { authCheckAndThrow } from "@lib/actions";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { Responses } from "./Responses";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["form-builder-responses", "form-builder"], {
    lang: locale,
  });
  return {
    title: `${t("responses.title")} — ${t("gcForms")}`,
  };
}

export default async function Page() {
  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
  }));

  const isAuthenticated = session !== null;

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl">
        <LoggedOutTab tabName={LoggedOutTabName.RESPONSES} />
      </div>
    );
  }

  return (
    <>
      <h1>Responses</h1>

      <Responses
        responseDownloadLimit={Number(await getAppSetting("responseDownloadLimit"))}
        overdueAfter={Number(await getAppSetting("nagwarePhaseEncouraged"))}
      />
    </>
  );
}
