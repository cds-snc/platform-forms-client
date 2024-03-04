import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { Contact } from "./components/client/Contact";
import { Success } from "./components/server/Success";

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
  const { t } = await serverTranslation(["form-builder"]);

  return (
    <>
      {success === undefined ? (
        <>
          <h1>{t("contactus.title")}</h1>
          <Contact />
        </>
      ) : (
        <>
          <Success />
        </>
      )}
    </>
  );
}
