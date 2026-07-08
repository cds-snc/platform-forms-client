import { serverTranslation } from "@i18n/server";
import { Metadata } from "next";
import { authCheckAndThrow } from "@lib/actions";
import { notFound } from "next/navigation";
import { Preview } from "./Preview";
import { allowGrouping } from "@root/lib/groups/utils/allowGrouping";
import { getTemplateClosureState } from "@lib/templates/queries/getTemplateClosureState";
import { ClosedDetails } from "@lib/types";
import { PreviewClosed } from "./PreviewClosed";
import { Language } from "@lib/types/form-builder-types";
import { getTemplateVersionState } from "@lib/templates/versioning/queries/getTemplateVersionState";
import { PublishedPreview } from "./PublishedPreview";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ id: string; locale: string }> }) {
  const params = await props.params;

  const { id, locale } = params;
  const isAnonymousPreview = id === "0000";

  const { session } = isAnonymousPreview
    ? { session: null }
    : await authCheckAndThrow().catch(() => ({
        session: null,
        ability: null,
      }));
  const disableSubmit = id === "0000" || !session?.user;

  const isAllowGrouping = allowGrouping();

  const formID = id;

  if (!session?.user && formID !== "0000") {
    return notFound();
  }

  const templateVersionState = await getTemplateVersionState(id);

  if (templateVersionState?.isPublished && !templateVersionState.currentDraftVersionId) {
    return <PublishedPreview locale={locale as Language} id={id} />;
  }

  // A non authenticated user can't set a closing date on a form.
  const closedDetails = session ? await getTemplateClosureState(id) : null;

  if (closedDetails && closedDetails.isPastClosingDate) {
    return <PreviewClosed closedDetails={closedDetails.closedDetails as ClosedDetails} />;
  }

  return <Preview disableSubmit={disableSubmit} allowGrouping={isAllowGrouping} />;
}
