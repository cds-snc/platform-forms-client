import { serverTranslation } from "@i18n";
import Markdown from "markdown-to-jsx";
import { InfoCard } from "@serverComponents/globals/InfoCard/InfoCard";
import { VaultDelivery } from "../VaultDelivery";
import { Language } from "@lib/types/form-builder-types";

export const PublishInfo = async ({ locale }: { locale: Language }) => {
  const { t } = await serverTranslation("form-builder", { lang: locale });

  return (
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
  );
};
