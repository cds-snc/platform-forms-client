import { redirect } from "next/navigation";
import { Metadata } from "next";
import Markdown from "markdown-to-jsx";

import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { ApiKeyButton } from "./components/ApiKeyButton";
import { ApiKeyDialog } from "../../components/dialogs/ApiKeyDialog/ApiKeyDialog";
import { DeleteApiKeyDialog } from "../../components/dialogs/DeleteApiKeyDialog/DeleteApiKeyDialog";
import { AuthenticatedPage } from "@lib/pages/auth";

import { getCurrentThrottlingRate } from "../manage/throttlingRate/actions";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { getFullTemplateByID } from "@lib/templates";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("settings.apiIntegration.navigation.title")} — ${t("gcForms")}`,
  };
}

export default AuthenticatedPage(
  async (props: { params: Promise<{ id: string; locale: string }> }) => {
    const params = await props.params;

    const { locale } = params;

    const { id } = params;

    const limit = await getCurrentThrottlingRate(id);
    let rate = null;

    if ("error" in limit) {
      // no-op no need to handle as this is just to show or hide the suoport text
    } else {
      rate = limit.rate;
    }

    const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

    const { t } = await serverTranslation("form-builder", { lang: locale });

    if (session && !session.user.acceptableUse) {
      // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
      redirect(`/${locale}/auth/policy`);
    }

    if (session && !session.user.hasSecurityQuestions) {
      // If they haven't setup security questions Use redirect to policy page for acceptance
      redirect(`/${locale}/auth/setup-security-questions`);
    }

    // Get template and check if delivery option is email
    const template = await getFullTemplateByID(id);
    const isEmailDelivery = template?.deliveryOption?.emailAddress !== undefined;

    if (isEmailDelivery) {
      return (
        <div>
          <h2>{t("settings.apiIntegration.page.isEmailDelivery.title")}</h2>
          <p>{t("settings.apiIntegration.page.isEmailDelivery.description")}</p>
        </div>
      );
    }

    return (
      <div className="w-7/12">
        <h2 className="mb-6">{t("settings.apiIntegration.page.title")}</h2>
        <p className="mb-4">{t("settings.apiIntegration.page.text1")}</p>

        <LinkButton.Secondary
          target="_blank"
          className="mb-6"
          href={t("settings.apiIntegration.page.docsButton.link")}
        >
          {t("settings.apiIntegration.page.docsButton.text")}
        </LinkButton.Secondary>

        <p className="mb-2">
          <strong>{t("settings.apiIntegration.page.apiKey.title")}</strong>
        </p>
        <p className="mb-6">{t("settings.apiIntegration.page.apiKey.description")}</p>

        <ApiKeyButton />

        {rate === null ? (
          <div>
            <p className="mb-4">
              <strong>{t("settings.apiIntegration.page.apiKey.rateLimit.title")}</strong>
            </p>
            <p className="text-sm">
              <strong>{t("settings.apiIntegration.page.apiKey.rateLimit.currentLimit")}</strong>
            </p>
            <p className="mb-2">
              {t("settings.apiIntegration.page.apiKey.rateLimit.currentLimitDescription")}
            </p>
            <Markdown options={{ forceBlock: true }} className="mb-4">
              {t("settings.apiIntegration.page.apiKey.rateLimit.increaseRequest")}
            </Markdown>
          </div>
        ) : (
          <p className="mb-4" data-id="already-set"></p>
        )}

        <ApiKeyDialog />
        <DeleteApiKeyDialog />
      </div>
    );
  }
);
