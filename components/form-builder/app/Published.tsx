import React, { useState, useEffect } from "react";
import { RocketIcon } from "../icons/RocketIcon";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { themes } from "./shared/Button";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import { useAccessControl } from "@lib/hooks";
import Link from "next/link";
import Markdown from "markdown-to-jsx";
import { getHost } from "../util";

export const Published = ({ id }: { id: string }) => {
  const { t } = useTranslation("form-builder");
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
      router.push("/form-builder/edit");
    }
  }, [status, router, formId]);

  if (!formId) {
    return null;
  }

  return (
    <div>
      <h1 className="visually-hidden">{t("published")}</h1>
      <div className="p-7 mb-10 flex bg-green-50">
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
          <Link href="/myforms">
            <a href="/myforms" className={`${themes.primary} ${themes.base} ${themes.htmlLink}`}>
              {t("publishedBack")}
            </a>
          </Link>
        )}
      </div>
    </div>
  );
};
