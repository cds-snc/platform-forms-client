import { Metadata } from "next";
import { serverTranslation } from "@i18n";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder-responses", { lang: locale });
  return {
    title: `${t("responsesBeta.pageTitle")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const params = await props.params;

  const { locale, id } = params;
  return (
    <div>
      <p>Location</p>
      <LinkButton.Primary href={`/${locale}/form-builder/${id}/responses-beta/format`}>
        Next
      </LinkButton.Primary>
    </div>
  );
}
