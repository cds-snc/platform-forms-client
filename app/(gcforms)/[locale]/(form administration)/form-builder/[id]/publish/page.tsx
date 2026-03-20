import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { authorization } from "@lib/privileges";
import { authCheckAndThrow } from "@lib/actions";
import { WaitForId } from "../components/WaitForId";
import { LoggedOutTab, LoggedOutTabName } from "@serverComponents/form-builder/LoggedOutTab";
import { Language } from "@lib/types/form-builder-types";
import { cn } from "@lib/utils";
import { PublishCard } from "./components/PublishCard";
import { PublishInfo } from "./components/PublishInfo";
import { getFullTemplateByID, getTemplatePublishedStatus } from "@root/lib/templates";
import { responsesAwaitingConfirmationExist } from "@root/lib/vault";
import { redirect } from "next/navigation";

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

  const isPublished = await getTemplatePublishedStatus(id);

  if (isPublished) {
    redirect(`/${locale}/form-builder/${id}/published`);
  }

  const template = await getFullTemplateByID(id);
  const sourceTemplateId =
    typeof template?.sourceTemplateId === "string" ? template.sourceTemplateId : undefined;
  const workingCopyHasResponsesAwaitingConfirmation = await responsesAwaitingConfirmationExist(id);
  const sourceTemplateIsPublished = sourceTemplateId
    ? await getTemplatePublishedStatus(sourceTemplateId)
    : false;
  const sourceTemplateHasResponsesAwaitingConfirmation = sourceTemplateId
    ? await responsesAwaitingConfirmationExist(sourceTemplateId)
    : false;

  const userCanPublish = await authorization
    .canPublishForm(id)
    .then(() => true)
    .catch(() => false);

  return (
    <div className="mr-6">
      <div
        className={cn(
          "grid gap-4",
          userCanPublish ? "grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3" : "grid-cols-1"
        )}
      >
        <div className={cn(userCanPublish && "tablet:col-span-1 laptop:col-span-2")}>
          <PublishCard
            id={id}
            locale={locale as Language}
            sourceTemplateId={sourceTemplateId}
            sourceTemplateIsPublished={sourceTemplateIsPublished ?? false}
            sourceTemplateHasResponses={sourceTemplateHasResponsesAwaitingConfirmation}
            workingCopyHasResponses={workingCopyHasResponsesAwaitingConfirmation}
          />
        </div>
        {userCanPublish && (
          <div>
            <PublishInfo locale={locale as Language} />
          </div>
        )}
      </div>
    </div>
  );
}
