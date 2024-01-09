import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import { StyledLink } from "@clientComponents/globals/StyledLink/StyledLink";
import UserNavLayout from "@clientComponents/globals/layouts/UserNavLayout";
import { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("signup", { lang: locale });
  return {
    title: t("accountCreated.title"),
  };
}

export default async function Page() {
  const { t, i18n } = await serverTranslation(["signup"]);
  await requireAuthentication();

  return (
    <UserNavLayout contentWidth="tablet:w-[658px]">
      <h1 className="border-b-0 mt-6 mb-12">{t("accountCreated.title")}</h1>
      <h2>{t("accountCreated.yourAccountListDescription")}</h2>
      <ul>
        <li>{t("accountCreated.yourAccountList.item1")}</li>
        <li>{t("accountCreated.yourAccountList.item2")}</li>
        <li>{t("accountCreated.yourAccountList.item3")}</li>
      </ul>
      <h2 className="mt-8">{t("accountCreated.notIncluded.title")}</h2>
      <p>{t("accountCreated.notIncluded.paragraph1")}</p>
      <h2 className="mt-8">{t("accountCreated.unlockPublishing.title")}</h2>
      <p>{t("accountCreated.unlockPublishing.paragraph1")}</p>
      <p className="mt-6">{t("accountCreated.unlockPublishing.paragraph2")}</p>
      <div className="mt-20">
        <StyledLink
          href={`/${i18n.language}/unlock-publishing/`}
          theme="primaryButton"
          className="mr-4"
        >
          {t("accountCreated.unlockPublishingButton")}
        </StyledLink>
        <StyledLink
          href={`/${i18n.language}/forms/`}
          theme="secondaryButton"
          testid="skipStepButton"
        >
          {t("accountCreated.skipStepButton")}
        </StyledLink>
      </div>
    </UserNavLayout>
  );
}
