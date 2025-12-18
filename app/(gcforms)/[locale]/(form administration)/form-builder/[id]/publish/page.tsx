import { serverTranslation } from "@i18n";
import { Metadata } from "next";

import { authorization } from "@lib/privileges";
import { authCheckAndThrow } from "@lib/actions";
import { WaitForId } from "../components/WaitForId";

import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";

import { ClientContainer } from "./ClientContainer";
import { Language } from "@lib/types/form-builder-types";

import { cn } from "@lib/utils";

import { PublishCard } from "./components/PublishCard";
import { PublishInfo } from "./components/PublishInfo";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublish")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;

  const { id, locale } = params;

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
  }));

  if (!session) {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  if (id === "0000") {
    return <WaitForId locale={locale as Language} path="publish" />;
  }

  const userCanPublish = await authorization
    .canPublishForm(id)
    .then(() => true)
    .catch(() => false);

  return (
    <ClientContainer id={id}>
      <div className="mr-6">
        <div
          className={cn(
            "grid gap-4",
            userCanPublish ? "grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3" : "grid-cols-1"
          )}
        >
          <div className={cn(userCanPublish && "tablet:col-span-1 laptop:col-span-2")}>
            <PublishCard id={id} locale={locale as Language} />
          </div>
          {userCanPublish && (
            <div>
              <PublishInfo locale={locale as Language} />
            </div>
          )}
        </div>
      </div>
    </ClientContainer>
  );
}
