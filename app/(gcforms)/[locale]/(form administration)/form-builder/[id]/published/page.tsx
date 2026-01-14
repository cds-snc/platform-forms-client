import { ViewTransition } from "react";
import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getFullTemplateByID } from "@lib/templates";

import { RocketIcon } from "@serverComponents/icons/RocketIcon";
import { LinkButton } from "@serverComponents/globals/Buttons/LinkButton";
import { getOrigin } from "@lib/origin";
import Markdown from "markdown-to-jsx";

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

  const {
    t,
    i18n: { language },
  } = await serverTranslation("form-builder", { lang: locale });

  const { session } = await authCheckAndThrow().catch(() => ({
    session: null,
    ability: null,
  }));

  const template = await getFullTemplateByID(id);

  if (!session || !template) {
    redirect(`/${locale}/auth/login`);
  }

  const baseUrl = await getOrigin();

  const linkEn = `${baseUrl}/en/id/${id}`;
  const linkFr = `${baseUrl}/fr/id/${id}`;

  if (!template.isPublished) {
    redirect(`/${locale}/form-builder/${id}/publish`);
  }

  return (
    <ViewTransition>
      <div className="mr-10">
        <h1 className="visually-hidden">{t("published")}</h1>
        <div className="mb-10 flex bg-purple-200 p-7">
          <div className="flex">
            <div className="flex p-7">
              <RocketIcon className="block self-center" />
            </div>
          </div>
          <div>
            <h2 className="mb-1 pb-0"> {t("publishedTitle")}</h2>
            <p className="mb-5 mt-0">{t("publishedViewLinks")}</p>
            <p>
              <strong>{t("english")}</strong>{" "}
              <a href={linkEn} data-testid="published-link-en">
                {linkEn}
              </a>
            </p>
            <p>
              <strong>{t("french")}</strong>{" "}
              <a href={linkFr} data-testid="published-link-fr">
                {linkFr}
              </a>
            </p>
          </div>
        </div>
        <div className="mb-5">
          <h3 className="mb-1">{t("publishedErrors")}</h3>
          <Markdown options={{ forceBlock: true }}>{t("ifYouAreExperiencingProblems")}</Markdown>
        </div>
        <div className="mb-10">
          <h3 className="mb-1">{t("provideFeedback")}</h3>
          <Markdown options={{ forceBlock: true }}>{t("didYouFindThisToolHelpful")}</Markdown>
        </div>
        <div>
          <LinkButton.Primary href={`/${language}/forms`}>{t("publishedBack")}</LinkButton.Primary>
        </div>
      </div>
    </ViewTransition>
  );
}
