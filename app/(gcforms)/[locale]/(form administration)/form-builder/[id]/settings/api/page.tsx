import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { ApiKey } from "./components/client/ApiKey";
import { authCheckAndThrow } from "@lib/actions";
import { checkKey } from "./actions";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsSettings")} — ${t("gcForms")}`,
  };
}

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const session = await authCheckAndThrow().catch(() => null);
  if (session === null) return null;

  const keyExists = await checkKey(id);

  return <ApiKey keyExists={keyExists} />;
}
