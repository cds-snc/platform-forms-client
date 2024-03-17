import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { MFAForm } from "./components/client/MFAForm";
import { auth } from "@lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAbility } from "@lib/privileges";
import { getUnprocessedSubmissionsForUser } from "@lib/users";
import { logMessage } from "@lib/logger";

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
  const session = await auth();

  if (session) {
    if (session.user.acceptableUse && session.user.hasSecurityQuestions) {
      redirect(`/${locale}/forms`);
    }
    logMessage.debug(`Session exists in action for user ${session.user.name}`);
    if (session.user.newlyRegistered) {
      redirect(`/${locale}/auth/policy?referer=/auth/account-created`);
    }

    const ability = createAbility(session);

    // Get user
    const user = session.user;

    const overdue = await getUnprocessedSubmissionsForUser(ability, user.id).catch((err) => {
      logMessage.warn(`Error getting unprocessed submissions for user ${user.id}: ${err.message}`);
      // Fail gracefully if we can't get the unprocessed submissions.
      return {};
    });

    logMessage.debug(`${user.name} has ${Object.keys(overdue).length} overdue submissions`);

    let hasOverdueSubmissions = false;

    Object.entries(overdue).forEach(([, value]) => {
      if (value.level > 2) {
        hasOverdueSubmissions = true;
        return;
      }
    });

    if (hasOverdueSubmissions) {
      return redirect(`/${locale}/auth/restricted-access`);
    }

    logMessage.debug(`Redirecting to policy page for user ${user.name}`);

    redirect(`/${locale}/auth/policy`);
  }
  const authToken = cookies().get("authenticationFlow");
  return <MFAForm authFlowToken={authToken} />;
}
