import { serverTranslation } from "@i18n";
import { authorization } from "@lib/privileges";
import { Metadata } from "next";
import { AuthenticatedPage } from "@lib/pages/auth";
import { Search } from "./components/Search";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("admin-events", { lang: locale });
  return {
    title: `${t("title")}`,
  };
}

export default AuthenticatedPage([authorization.hasAdministrationPrivileges], async () => {
  const { t } = await serverTranslation("admin-events");

  return (
    <>
      <h1 className="mb-10 border-0">{t("title")}</h1>
      <Search />
    </>
  );
});
