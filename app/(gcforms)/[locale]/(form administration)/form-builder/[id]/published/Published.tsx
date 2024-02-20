import React from "react";
import { RocketIcon } from "@serverComponents/icons/RocketIcon";
import { LinkButton } from "@clientComponents/globals";
import { serverTranslation } from "@i18n";
import Markdown from "markdown-to-jsx";

export const Published = async ({
  locale,
  id,
  canView,
}: {
  locale: string;
  id: string;
  canView: boolean;
}) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("form-builder", { lang: locale });

  const linkEn = `/en/id/${id}`;
  const linkFr = `/fr/id/${id}`;

  return (
    <div>
      <h1 className="visually-hidden">{t("published")}</h1>
      <div className="mb-10 flex bg-green-50 p-7">
        <div className="flex">
          <div className="flex p-7">
            <RocketIcon className="block self-center" />
          </div>
        </div>
        <div>
          <h2 className="mb-1 pb-0"> {t("publishedTitle")}</h2>
          <p className="mb-5 mt-0">{t("publishedViewLinks")}</p>
          <p>
            <strong>{t("english")}</strong> <a href={linkEn}>{linkEn}</a>
          </p>
          <p>
            <strong>{t("french")}</strong> <a href={linkFr}>{linkFr}</a>
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
        {canView && (
          <LinkButton.Primary href={`/${language}/forms`}>{t("publishedBack")}</LinkButton.Primary>
        )}
      </div>
    </div>
  );
};
