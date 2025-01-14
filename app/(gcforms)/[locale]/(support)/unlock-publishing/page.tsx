import { serverTranslation } from "@i18n";
import { prisma } from "@lib/integration/prismaConnector";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { UnlockPublishingForm } from "./components/client/UnlockPublishingForm";
import { AuthenticatedPage } from "@lib/pages/auth";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("unlock-publishing", { lang: locale });
  return {
    title: t("unlockPublishing.title"),
  };
}

export default AuthenticatedPage(async ({ params, session }) => {
  const { locale } = await params;

  const hasPublishPrivilege = await prisma.user.count({
    where: {
      email: session.user.email,
      privileges: {
        some: {
          name: "PublishForms",
        },
      },
    },
  });

  if (hasPublishPrivilege > 0) {
    redirect(`/${locale}/forms`, RedirectType.replace);
  }

  return <UnlockPublishingForm userEmail={session.user.email} />;
});
