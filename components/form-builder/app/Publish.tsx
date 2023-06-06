import React, { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useTemplateStore } from "../store";
import { useTemplateApi, useAllowPublish } from "../hooks";
import { CancelIcon, CircleCheckIcon, WarningIcon, LockIcon } from "../icons";
import { Button } from "@components/globals";
import Link from "next/link";
import { LoggedOutTab, LoggedOutTabName } from "./LoggedOutTab";

export const Publish = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
  const router = useRouter();
  const {
    userCanPublish,
    data: { title, questions, privacyPolicy, translate, confirmationMessage },
    isPublishable,
  } = useAllowPublish();

  const [error, setError] = useState(false);
  const { i18n } = useTranslation("common");

  const { id, setId, getSchema, getName } = useTemplateStore((s) => ({
    id: s.id,
    setId: s.setId,
    getSchema: s.getSchema,
    getName: s.getName,
  }));

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="mr-2 w-9 fill-green-700 inline-block" title={t("completed")} />
    ) : (
      <CancelIcon className="mr-2 w-9 fill-red-700 w-9 h-9 inline-block" title={t("incomplete")} />
    );
  };

  const { save } = useTemplateApi();

  const handlePublish = async () => {
    const result = await save({
      jsonConfig: getSchema(),
      name: getName(),
      formID: id,
      publish: true,
    });

    if (result && result?.error) {
      setError(true);
      return;
    }

    setId(result?.id);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "publish_form",
    });
    router.push({ pathname: `/form-builder/published` });
  };

  const handleSaveAndRequest = useCallback(async () => {
    const result = await save({
      jsonConfig: getSchema(),
      name: getName(),
      formID: id,
      publish: false,
    });

    if (result && result?.error) {
      setError(true);
      return;
    }

    router.push({ pathname: `/unlock-publishing` });
  }, [getSchema, getName, id, save, router]);

  if (status !== "authenticated") {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  return (
    <>
      <h1 className="border-0 mb-0">{t("publishYourForm")}</h1>
      <p className="mb-0">{t("publishYourFormInstructions")}</p>
      {!userCanPublish && (
        <div className="mt-5 mb-5 p-5 bg-purple-200 flex">
          <div className="flex">
            <div className="pr-7">
              <LockIcon className="mb-2 scale-125" />
            </div>
          </div>
          <div>
            <h3 className="mb-1">{t("unlockPublishing")}</h3>
            <p className="mb-5">{t("unlockPublishingDescription")}</p>
            <p>
              <Button theme="secondary" onClick={handleSaveAndRequest}>
                {t("saveAndRequest")}
              </Button>
            </p>
          </div>
        </div>
      )}

      <ul className="list-none p-0">
        <li className="mb-4 mt-4">
          <Icon checked={title} />
          <Link href={`/${i18n.language}/form-builder/edit#formTitle`}>{t("formTitle")}</Link>
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={questions} />
          <Link href={`/${i18n.language}/form-builder/edit`}>{t("questions")}</Link>
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={privacyPolicy} />
          <Link href={`/${i18n.language}/form-builder/edit#privacy-text`}>
            {t("privacyStatement")}
          </Link>
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={confirmationMessage} />
          <Link href={`/${i18n.language}/form-builder/edit#confirmation-text`}>
            {t("formConfirmationMessage")}
          </Link>
        </li>
        <li className="mb-4 mt-4">
          <Icon checked={translate} />
          <Link href={`/${i18n.language}/form-builder/edit/translate`}>{t("translate")}</Link>
        </li>
      </ul>

      {userCanPublish && isPublishable() && (
        <>
          <div className="mt-10 p-5 bg-yellow-100 flex">
            <div className="flex">
              <div className="pr-7">
                <WarningIcon />
              </div>
            </div>
            <div>
              <h2 className="mb-1 text-h3 pb-0 mb-0">{t("publishingDisablesEditing")}</h2>
              <p>{t("publishingDisablesEditingDescription")}</p>
              <Markdown options={{ forceBlock: true }}>
                {t("contactSupportIfYouHaveQuestions")}
              </Markdown>
            </div>
          </div>
          <Button className="mt-5" onClick={handlePublish}>
            {t("publish")}
          </Button>
          <div
            role="alert"
            className={`inline-block ml-5 py-1 px-3 
            ${error ? "text-red-destructive bg-red-100" : ""}
            ${!error ? "hidden" : ""}`}
          >
            <>{error && <p>{t("thereWasAnErrorPublishing")}</p>}</>
          </div>
        </>
      )}
    </>
  );
};
