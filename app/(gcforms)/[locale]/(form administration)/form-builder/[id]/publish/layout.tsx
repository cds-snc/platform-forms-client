import { serverTranslation } from "@i18n";
import { authCheck } from "@lib/actions";

import Markdown from "markdown-to-jsx";

import { InfoCard } from "@serverComponents/globals/InfoCard/InfoCard";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { getFullTemplateByID } from "@lib/templates";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
  params: { locale, id },
}: {
  children: React.ReactNode;
  params: { locale: string; id: string };
}) {
  const { t } = await serverTranslation("form-builder", { lang: locale });

  const { session, ability } = await authCheck().catch(() => ({ session: null, ability: null }));
  let userCanPublish = false;
  let isVaultDelivery = false;

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  try {
    userCanPublish = ability?.can("update", "FormRecord", "isPublished");
    const initialForm = ability && (await getFullTemplateByID(ability, id));

    if (initialForm?.isPublished) {
      redirect(`/${locale}/form-builder/${id}/published`);
    }

    initialForm?.deliveryOption === undefined && (isVaultDelivery = true);
  } catch (e) {
    // no-op
  }

  return (
    <div className="mr-10 flex flex-wrap justify-between laptop:flex-nowrap">
      <div className="min-w-fit grow rounded-lg border-1 p-5">
        <h1 className="mb-2 border-0">{t("publishYourForm")}</h1>
        <p className="mb-0 text-lg">{t("publishYourFormInstructions.text1")}</p>
        {children}
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
              {isVaultDelivery && (
                <>
                  <li className="mb-5 bg-gray-50 p-1.5">
                    <h3 className="gc-h4 mb-1 pb-0 text-lg">
                      {t("publishingRemovesTestResponses")}
                    </h3>
                    <p className="text-sm">{t("publishingRemovesTestResponsesDescription")}</p>
                  </li>
                </>
              )}
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
  );
}
