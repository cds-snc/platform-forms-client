import React, { useState, useEffect } from "react";
import { RocketIcon } from "../../../serverComponents/icons/RocketIcon";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LinkButton } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "../store/useTemplateStore";
import { useAccessControl } from "@lib/hooks";
import Markdown from "markdown-to-jsx";

export const Published = ({ id }: { id: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const { status } = useSession();
  const router = useRouter();
  const [formId] = useState(id);
  const { ability } = useAccessControl();
  const resetForm = useTemplateStore((s) => s.initialize);
  const linkEn = `${getHost()}/en/id/${formId}`;
  const linkFr = `${getHost()}/fr/id/${formId}`;

  // reset the form once we reach the published page
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (status !== "authenticated" || !formId) {
      router.push(`/${language}/form-builder/0000/edit`);
    }
  }, [status, router, formId, language]);

  if (!formId) {
    return null;
  }

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
        {ability?.can("view", "FormRecord") && (
          <LinkButton.Primary href={`/${language}/forms`}>{t("publishedBack")}</LinkButton.Primary>
        )}
      </div>
    </div>
  );
};
