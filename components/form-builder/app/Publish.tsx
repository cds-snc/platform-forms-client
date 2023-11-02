import React, { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useTemplateStore } from "../store";
import { useTemplateApi, useAllowPublish } from "../hooks";
import { CancelIcon, CircleCheckIcon, LockIcon } from "../icons";
import { Button, Alert } from "@components/globals";
import Link from "next/link";
import { LoggedOutTab, LoggedOutTabName } from "./LoggedOutTab";
import { InfoCard } from "@components/globals/InfoCard/InfoCard";
import { isVaultDelivery } from "@formbuilder/util";
import { StyledLink } from "@components/globals";
import { classificationOptions } from "./ClassificationSelect";
import { logMessage } from "@lib/logger";

export const Publish = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const router = useRouter();
  const {
    userCanPublish,
    data: { title, questions, privacyPolicy, translate, confirmationMessage },
    isPublishable,
  } = useAllowPublish();

  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState<null | number>(null);
  const lang = i18n.language;

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

  const securityOption: ClassificationOption | undefined = classificationOptions.find(
    (item) => item.value === securityAttribute
  );

  // Add an index signature to the ClassificationOption type to allow indexing with a string
  interface ClassificationOption {
    [key: string]: string;
    value: string;
  }

  let securityAttributeText: string = securityOption?.[lang] || securityAttribute;
  // remove (default) from the string
  securityAttributeText = securityAttributeText.replace(/\(.*?\)/g, "");

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
    ) : (
      <CancelIcon className="mr-2 inline-block h-9 w-9 fill-red-700" />
    );
  };

  const { save } = useTemplateApi();
  const supportHref = `/${i18n.language}/form-builder/support`;

  const handlePublish = async () => {
    setError(false);
    setErrorCode(null);
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
    setError(false);
    setErrorCode(null);
    const result = await save({
      jsonConfig: getSchema(),
      name: getName(),
      formID: id,
      publish: false,
    });

    if (result && result?.error) {
      logMessage.error(result?.error as Error);
      setError(true);
      setErrorCode(500);
      return;
    }

    router.push({ pathname: `/unlock-publishing` });
  }, [getSchema, getName, id, save, router]);

  if (status !== "authenticated") {
    return <LoggedOutTab tabName={LoggedOutTabName.PUBLISH} />;
  }

  return (
    <>
      <div className="flex flex-wrap justify-between laptop:flex-nowrap">
        <div className="mx-5 min-w-fit grow rounded-lg border-1 p-5">
          <h1 className="mb-2 border-0">{t("publishYourForm")}</h1>

          {!userCanPublish && error && (
            <Alert.Danger focussable={true} className="mb-5">
              <Alert.Title headingTag="h3">{t("errorSavingForm.title")}</Alert.Title>
              <p className="mb-2">
                {t("errorSavingForm.description")}{" "}
                <StyledLink href={supportHref}>{t("errorSavingForm.supportLink")}.</StyledLink>
              </p>
              <p className="text-sm">
                {errorCode && t("errorSavingForm.errorCode", { code: errorCode })}
              </p>
            </Alert.Danger>
          )}

          <p className="mb-0 text-lg">{t("publishYourFormInstructions.text1")}</p>
          {!userCanPublish && (
            <Alert.Info className="my-5">
              <Alert.IconWrapper className="mr-7">
                <LockIcon className="mb-2 scale-125 fill-none stroke-none" />
              </Alert.IconWrapper>
              <Alert.Title headingTag="h2">{t("unlockPublishing")}</Alert.Title>

              <p className="mb-5">{t("unlockPublishingDescription")}</p>
              <p>
                <Button theme="secondary" onClick={handleSaveAndRequest}>
                  {t("saveAndRequest")}
                </Button>
              </p>
            </Alert.Info>
          )}

          <ul className="list-none p-0">
            <li className="my-4">
              <Icon checked={title} />
              <Link href={`/${i18n.language}/form-builder/edit#formTitle`}>{t("formTitle")}</Link>
            </li>
            <li className="my-4">
              <Icon checked={questions} />
              <Link href={`/${i18n.language}/form-builder/edit`}>{t("questions")}</Link>
            </li>
            <li className="my-4">
              <Icon checked={privacyPolicy} />
              <Link href={`/${i18n.language}/form-builder/edit#privacy-text`}>
                {t("privacyStatement")}
              </Link>
            </li>
            <li className="my-4">
              <Icon checked={confirmationMessage} />
              <Link href={`/${i18n.language}/form-builder/edit#confirmation-text`}>
                {t("formConfirmationMessage")}
              </Link>
            </li>
            <li className="my-4">
              <Icon checked={translate} />
              <Link href={`/${i18n.language}/form-builder/edit/translate`}>{t("translate")}</Link>
            </li>

            <li className="my-4">
              <Icon checked />
              <strong>
                {securityAttributeText}
                {t("publishYourFormInstructions.text2")},{" "}
              </strong>
              {isVaultDelivery(getDeliveryOption()) ? (
                <span>{t("publishYourFormInstructions.vaultOption")}</span>
              ) : (
                <span>{t("publishYourFormInstructions.emailOption")}</span>
              )}
              <StyledLink href={`/${i18n.language}/form-builder/settings`}>
                {t("publishYourFormInstructions.change")}
              </StyledLink>
            </li>
          </ul>

          {userCanPublish && isPublishable() && (
            <>
              <Button className="mt-5" onClick={handlePublish}>
                {t("publish")}
              </Button>
              <div
                role="alert"
                className={`ml-5 inline-block px-3 py-1 
            ${error ? "bg-red-100 text-red-destructive" : ""}
            ${!error ? "hidden" : ""}`}
              >
                <>{error && <p>{t("thereWasAnErrorPublishing")}</p>}</>
              </div>
            </>
          )}
        </div>
        {userCanPublish && isPublishable() && (
          <>
            <div className="mt-8 min-w-fit max-w-md flex-none laptop:mt-0 laptop:min-w-min">
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
