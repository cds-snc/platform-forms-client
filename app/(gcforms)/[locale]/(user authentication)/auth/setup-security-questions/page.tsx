import { serverTranslation } from "@i18n";
import { Metadata } from "next";

import { SetupSecurityQuestions } from "./clientSide";
import {
  requireAuthentication,
  retrievePoolOfSecurityQuestions,
  retrieveUserSecurityQuestions,
} from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { redirect } from "next/navigation";
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

// const Info = async () => {
//   const { t } = await serverTranslation(["setup-security-questions"]);
//   return (
//     <div className="mx-auto mt-10 w-[850px]">
//       <Alert.Info title={t("banner.title")} body={t("banner.body")} />
//     </div>
//   );
// };

export default async function Page({ params: { locale } }: { params: { locale: string } }) {
  const {
    user: { ability },
  } = await requireAuthentication();

  checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "FormRecord" }], {
    redirect: true,
  });

  const sessionSecurityQuestions = await retrieveUserSecurityQuestions({
    userId: ability.userID,
  });
  if (sessionSecurityQuestions && sessionSecurityQuestions.length >= 3) {
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

  return <SetupSecurityQuestions questions={questions} />;
}
