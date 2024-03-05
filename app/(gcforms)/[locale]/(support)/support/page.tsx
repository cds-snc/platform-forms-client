import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { SupportForm } from "./components/client/SupportForm";
import { Success } from "../components/server/Success";
import Link from "next/link";
import { Alert } from "@clientComponents/globals";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: t("support.title"),
  };
}

export default async function Page({
  searchParams: { success },
}: {
  searchParams: { success?: string };
}) {
  const {
    t,
    i18n: { language },
  } = await serverTranslation(["form-builder"]);

  return (
    <>
      {success === undefined ? (
        <>
          <h1>{t("support.title")}</h1>
          <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("support.useThisForm")}</p>
          <p className="mb-14">
            {t("support.gcFormsTeamPart1")}{" "}
            <Link href={`https://www.canada.ca/${language}/contact.html`}>
              {t("support.gcFormsTeamLink")}
            </Link>{" "}
            {t("support.gcFormsTeamPart2")}
          </p>
          <Alert.Warning title={t("support.lookingForADemo")} role="note">
            <p>
              {t("support.ifYouWouldLike")}{" "}
              <Link href={`/${language}/contact`}>{t("support.contactUs")}</Link>.
            </p>
          </Alert.Warning>
          <SupportForm />
        </>
      ) : (
        <Success />
      )}
    </>
  );
}
