import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Publish } from "./Publish";

import { authCheckAndThrow } from "@lib/actions";

import Markdown from "markdown-to-jsx";

import { InfoCard } from "@serverComponents/globals/InfoCard/InfoCard";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { VaultDelivery } from "./VaultDelivery";
import { ClientContainer } from "./ClientContainer";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublish")} — ${t("gcForms")}`,
  };
}

export default async function Page({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const { t } = await serverTranslation("form-builder", { lang: locale });

  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  const userCanPublish = ability?.can("update", "FormRecord", "isPublished");

  return (
    <ClientContainer>
      <div className="mr-10 flex flex-wrap justify-between laptop:flex-nowrap">
        <div className="min-w-fit grow rounded-lg border-1 p-5">
          <h1 className="mb-2 border-0">{t("publishYourForm")}</h1>
          <p className="mb-0 text-lg">{t("publishYourFormInstructions.text1")}</p>
          <Publish id={id} />
        </div>
        {userCanPublish && (
          <div className="mt-8 min-w-fit max-w-md flex-none laptop:mt-0 laptop:min-w-min">
            <InfoCard title={t("whatYouNeedToKnow")}>
              <ul className="list-none p-0">
                <li className="mb-5 bg-gray-50 p-1.5">
                  <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("publishingDisablesEditing")}</h3>
                  <p className="text-sm">{t("publishingDisablesEditingDescription")}</p>
                </li>
                <li className="mb-5 bg-gray-50 p-1.5">
                  <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("publishingLocksSettings")}</h3>
                  <p className="text-sm">{t("publishingLocksSettingsDescription")}</p>
                </li>
                <VaultDelivery />
              </ul>
              <div className="bg-gray-50 p-1.5">
                <Markdown options={{ forceBlock: true }} className="text-sm">
                  {t("contactSupportIfYouHaveQuestions")}
                </Markdown>
              </div>
            </InfoCard>
          </div>
        )}
      </div>
    </ClientContainer>
  );
}
