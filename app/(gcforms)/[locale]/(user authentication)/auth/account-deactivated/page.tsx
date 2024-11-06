import { serverTranslation } from "@i18n";
import { Metadata } from "next";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation(["deactivated"], { lang: locale });
  return {
    title: t("title"),
  };
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const { t } = await serverTranslation(["deactivated"], { lang: locale });
  const supportHref = `/${locale}/support`;
  return (
    <div>
      <h2 className="mb-6 mt-4 p-0">{t("title")}</h2>
      <p className="mb-10">{t("description")}</p>
      <div className="laptop:flex">
        <LinkButton.Primary href={supportHref} className="mb-2">
          {t("cta.label")}
        </LinkButton.Primary>
      </div>
    </div>
  );
}
