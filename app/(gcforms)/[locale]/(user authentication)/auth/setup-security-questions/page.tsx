import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { SecurityQuestionsForm } from "./components/client/SecurityQuestionsForm";
import { retrievePoolOfSecurityQuestions } from "@lib/auth";
import { redirect } from "next/navigation";
import { authCheckAndRedirect } from "@lib/actions";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation(["setup-security-questions"], { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const { session } = await authCheckAndRedirect();

  if (session.user.hasSecurityQuestions) {
    redirect(`/${locale}/profile`);
  }

  // Removes any removed (deprecated) questions and formats for the related language
  const questions: { id: string; question: string }[] = (await retrievePoolOfSecurityQuestions())
    .filter((q) => !q.deprecated)
    .map((q) => {
      return {
        id: q.id,
        question: locale === "fr" ? q.questionFr : q.questionEn,
      };
    });

  return (
    <div id="auth-panel">
      <SecurityQuestionsForm questions={questions} />
    </div>
  );
}
