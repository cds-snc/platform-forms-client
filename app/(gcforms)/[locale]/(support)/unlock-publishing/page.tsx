import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { checkPrivilegesAsBoolean } from "@lib/privileges";
import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { Success } from "./components/server/Success";
import { UnlockPublishingForm } from "./components/client/UnlockPublishingForm";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("unlock-publishing", { lang: locale });
  return {
    title: t("unlockPublishing.title"),
  };
}

export default async function Page({
  params: { locale },
  searchParams: { success },
}: {
  params: { locale: string };
  searchParams: { success?: string };
}) {
  const {
    user: { ability },
  } = await requireAuthentication();

  if (
    checkPrivilegesAsBoolean(ability, [
      { action: "update", subject: "FormRecord", field: "isPublished" },
    ])
  ) {
    // TODO ask about this vs. that - curently the below errors
    // return {
    //   redirect: {
    //     destination: `/${locale}/forms`,
    //     permanent: false,
    //   },
    // };
    redirect(`/${locale}/forms`, RedirectType.replace);
  }

  const { t } = await serverTranslation("unlock-publishing");

  return (
    <>
      {success === undefined ? (
        <>
          <h1>{t("unlockPublishing.title")}</h1>
          <p className="mb-14">{t("unlockPublishing.paragraph1")}</p>
          <UnlockPublishingForm />
        </>
      ) : (
        <Success />
      )}
    </>
  );
}
