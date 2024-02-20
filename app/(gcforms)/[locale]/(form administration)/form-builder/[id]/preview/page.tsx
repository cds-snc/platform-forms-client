import { serverTranslation } from "@i18n";
import { ClientSide } from "./clientSide";
import { Metadata } from "next";
import { auth } from "@lib/auth";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsEdit")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const session = await auth();

  const formID = id;

  if (!session?.user && formID !== "0000") {
    return notFound();
  }

  return <ClientSide />;
}
