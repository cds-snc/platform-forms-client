import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { DataView } from "./clientSide";
import { getAllTemplates } from "@lib/templates/queries/getAllTemplates";
import { AuthenticatedPage } from "@lib/pages/auth";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-templates", { lang: locale });
  return {
    title: `${t("view.title")}`,
  };
}

export default AuthenticatedPage([authorization.canManageAllForms], async () => {
  const allTemplates = await getAllTemplates();

  const templatesToDataViewObject = allTemplates.map((template) => {
    const {
      id,
      form: { titleEn, titleFr },
      isPublished,
      updatedAt,
    } = template;

    return { id, titleEn, titleFr, isPublished, updatedAt };
  });

  return <DataView templates={templatesToDataViewObject} />;
});
