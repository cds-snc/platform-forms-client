import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ReVerify } from "./components/client/ReVerify";
import { authCheckAndThrow } from "@lib/actions";
import { redirect } from "next/navigation";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation(["auth-verify"], { lang: locale });
  return {
    title: t("reVerify.title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const { locale } = params;

  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));
  if (session) {
    redirect(`/${locale}/forms`);
  }

  return <ReVerify />;
}
