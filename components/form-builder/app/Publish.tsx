import React, { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useTemplateStore } from "../store";
import { useTemplateApi, useAllowPublish } from "../hooks";
import { CancelIcon, CircleCheckIcon, LockIcon } from "../icons";
import { Button } from "@components/globals";
import Link from "next/link";
import { LoggedOutTab, LoggedOutTabName } from "./LoggedOutTab";
import { InfoCard } from "@components/globals/InfoCard/InfoCard";
import { isVaultDelivery } from "@formbuilder/util";

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

  const { id, setId, getSchema, getName, getDeliveryOption, securityAttribute } = useTemplateStore(
    (s) => ({
      id: s.id,
      setId: s.setId,
      getSchema: s.getSchema,
      getName: s.getName,
      getDeliveryOption: s.getDeliveryOption,
      securityAttribute: s.securityAttribute,
    })
  );

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="mr-2 w-9 fill-green-700 inline-block" />
    ) : (
      <CancelIcon className="mr-2 w-9 fill-red-700 w-9 h-9 inline-block" />
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
      <div className="flex justify-between flex-wrap laptop:flex-nowrap">
        <div className="grow border-1 rounded-lg p-5 mx-5 min-w-fit w-sm">
          <h1 className="border-0 mb-0">{t("publishYourForm")}</h1>
          <p className="mb-0 text-lg">{`${t(
            "publishYourFormInstructions.text1"
          )} ${securityAttribute} ${t("publishYourFormInstructions.text2")}`}</p>
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
        </div>
        {userCanPublish && isPublishable() && (
          <>
            <div className="flex-none max-w-md mt-8 laptop:mt-0 min-w-fit laptop:min-w-min">
              <InfoCard title={t("whatYouNeedToKnow")}>
                <ul className="list-none p-0">
                  <li className="mb-5 bg-gray-50 p-1.5">
                    <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("publishingDisablesEditing")}</h3>
                    <p className="text-sm">{t("publishingDisablesEditingDescription")}</p>
                  </li>
                  <li className="mb-5 bg-gray-50 p-1.5">
                    <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("publishingLocksSettings")}</h3>
                    <p className="text-sm">{t("publishingLocksSettingsDescription")}</p>
                  </li>
                  {isVaultDelivery(getDeliveryOption()) && (
                    <>
                      <li className="mb-5 bg-gray-50 p-1.5">
                        <h3 className="gc-h4 mb-1 pb-0 text-lg">
                          {t("publishingRemovesTestResponses")}
                        </h3>
                        <p className="text-sm">{t("publishingRemovesTestResponsesDescription")}</p>
                      </li>
                    </>
                  )}
                </ul>
                <div className="bg-gray-50 p-1.5">
                  <Markdown options={{ forceBlock: true }} className="text-sm">
                    {t("contactSupportIfYouHaveQuestions")}
                  </Markdown>
                </div>
              </InfoCard>
            </div>
          </>
        )}
      </div>
    </>
  );
};
