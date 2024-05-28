import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { MFAForm } from "./components/client/MFAForm";
import { redirect } from "next/navigation";
import { authCheckAndThrow } from "@lib/actions";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["auth-verify"], { lang: locale });
  return {
    title: t("verify.title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { session } = await authCheckAndThrow().catch(() => ({ session: null }));

  if (session) {
    redirect(`/${locale}/forms`);
  }

  return (
    <div id="auth-panel">
      <MFAForm />
    </div>
  );
}
