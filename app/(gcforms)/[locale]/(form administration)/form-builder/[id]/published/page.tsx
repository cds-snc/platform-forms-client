import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { Metadata } from "next";
import { ClientContainer } from "./ClientContainer";
import { Published } from "./Published";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const { t } = await serverTranslation("form-builder", { lang: locale });
  return {
    title: `${t("gcFormsPublished")} — ${t("gcForms")}`,
  };
}

export default async function Page(props: { params: Promise<{ locale: string; id: string }> }) {
  const params = await props.params;

  const { locale, id } = params;

  const { session, ability } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  if (!session) {
    return null;
  }

  try {
    const canView = ability?.can("view", "FormRecord");
    return (
      <ClientContainer>
        <Published id={id} locale={locale} canView={canView} />
      </ClientContainer>
    );
  } catch (e) {
    return null;
  }
}
