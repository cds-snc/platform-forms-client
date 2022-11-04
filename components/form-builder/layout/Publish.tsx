import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import React, { useState } from "react";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { usePublish } from "../hooks/usePublish";
import { CancelIcon, CircleCheckIcon } from "../icons";
import { Button } from "../shared/Button";
import Link from "next/link";
import { useNavigationStore } from "../store/useNavigationStore";

export const Publish = () => {
  const { t } = useTranslation("form-builder");
  const {
    data: { title, questions, privacyPolicy, translate, responseDelivery, confirmationMessage },
    isPublishable,
  } = useAllowPublish();

  const [error, setError] = useState(false);

  const { getSchema, id, setId } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  const { setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="w-9 fill-green-700 inline-block" title={t("completed")} />
    ) : (
      <CancelIcon className="w-9 fill-red-700 w-9 h-9 inline-block" title={t("incomplete")} />
    );
  };

  const { uploadJson } = usePublish();

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id, true);
    if (result && result?.error) {
      setError(true);
      return;
    }

    setId(result?.id);
  };

  return (
    <>
      <h1 className="border-0 mb-0">{t("publishYourForm")}</h1>
      <p>{t("publishYourFormInstructions")}</p>

      <ul className="list-none p-0">
        <li className="mb-4 mt-8">
          <Icon checked={title} /> {t("publisher")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={questions} /> {t("questions")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={privacyPolicy} /> {t("privacyStatement")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={translate} /> {t("translate")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={responseDelivery} /> {t("responseDelivery")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={title} /> {t("formTitle")}
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={confirmationMessage} /> {t("formConfirmationMessage")}
        </li>
      </ul>

      <p className="leading-10 mt-6 mb-4">
        <Link href={""}>Support</Link>
      </p>
      {isPublishable() && (
        <>
          <Button onClick={handlePublish}>{t("publish")}</Button>

          <div
            role="alert"
            className={`inline-block ml-5 py-1 px-3 
            ${error ? "text-red-destructive bg-red-100" : ""}
            ${id ? "text-green-darker bg-green-100" : ""} 
            ${!id && !error ? "hidden" : ""}`}
          >
            {id && setTab("published")}
            {error && <p>There was an error publishing the form</p>}
          </div>
        </>
      )}
    </>
  );
};
