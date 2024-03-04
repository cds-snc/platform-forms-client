import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ContactForm } from "./components/client/ContactForm";
import { Success } from "../components/server/Success";
import { Alert } from "@clientComponents/globals";
import Link from "next/link";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("contactus.title")}`,
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
          <h1>{t("contactus.title")}</h1>
          <p className="mb-6 mt-[-2rem] text-[1.6rem]">{t("contactus.useThisForm")}</p>
          <p className="mb-14">
            {t("contactus.gcFormsTeamPart1")}{" "}
            <Link href={`https://www.canada.ca/${language}/contact.html`}>
              {t("contactus.gcFormsTeamLink")}
            </Link>{" "}
            {t("contactus.gcFormsTeamPart2")}
          </p>
          <Alert.Warning title={t("contactus.needSupport")} role="note">
            <p>
              {t("contactus.ifYouExperience")}{" "}
              <Link href={`/support`}>{t("contactus.supportFormLink")}</Link>.
            </p>
          </Alert.Warning>
          <ContactForm />
        </>
      ) : (
        <>
          <Success />
        </>
      )}
    </>
  );
}
