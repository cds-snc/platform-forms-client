import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { Problems } from "./Problems";

// Match the other form-builder pages while metadata depends on the request locale.
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await serverTranslation("form-builder", { lang: locale });
  return { title: `${t("migrationProblems.title")} — ${t("gcForms")}` };
}

export default function Page() {
  return <Problems />;
}
