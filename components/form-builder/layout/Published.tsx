import React, { useState, useEffect } from "react";
import { RocketIcon } from "../icons/RocketIcon";
import { themes } from "../shared/Button";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import { useAccessControl } from "@lib/hooks";
import Link from "next/link";

const getHost = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.host}`;
};

export const Published = ({ id }: { id: string }) => {
  const [formId] = useState(id);
  const { ability } = useAccessControl();
  const resetForm = useTemplateStore((s) => s.initialize);
  const linkEn = `${getHost()}/en/id/${formId}`;
  const linkFr = `${getHost()}/fr/id/${formId}`;

  // reset the form once we reach the published page
  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const { t } = useTranslation("form-builder");
  return (
    <div>
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
            <strong>English:</strong> <a href={linkEn}>{linkEn}</a>
          </p>
          <p>
            <strong>French:</strong> <a href={linkFr}>{linkFr}</a>
          </p>
        </div>
      </div>
      <div className="mb-5">
        <h3 className="mb-1">{t("publishedErrors")}</h3>
        <p>
          If you are experiencing any problems with your published form, please{" "}
          <a href="http://example.com">contact support.</a>
        </p>
      </div>
      <div className="mb-10">
        <h3 className="mb-1">Provide feedback</h3>
        <p>
          Did you find this tool helpful? <a href="http://example.com">Provide feedback</a>
        </p>
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
