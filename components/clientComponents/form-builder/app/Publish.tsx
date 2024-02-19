"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { useTemplateStore } from "../store";
import { useTemplateApi, useAllowPublish, useRehydrate } from "../hooks";
import { CancelIcon, CircleCheckIcon, LockIcon } from "../../../serverComponents/icons";
import { Button, Alert } from "@clientComponents/globals";
import Link from "next/link";
import { isVaultDelivery } from "@clientComponents/form-builder/util";
import { StyledLink } from "@clientComponents/globals";
import { classificationOptions } from "./ClassificationSelect";
import { logMessage } from "@lib/logger";
import { DownloadFileButton } from "./shared";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export const Publish = () => {
  const { t, i18n } = useTranslation("form-builder");
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
    router.push(`/form-builder/${id}/published`);
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
      setErrorCode(result.error.response?.status || 400);
      return;
    }

    router.push(`/unlock-publishing`);
  }, [getSchema, getName, id, save, router]);

  const hasHydrated = useRehydrate();

  const IconLoading = (
    <Skeleton
      inline
      circle={true}
      width={36}
      height={36}
      className="my-2 mr-2 inline-block w-9 align-middle"
    />
  );

  return (
    <div>
      {!userCanPublish && error && hasHydrated && (
        <Alert.Danger focussable={true} className="mb-5">
          <Alert.Title headingTag="h3">{t("errorSavingForm.title")}</Alert.Title>
          <p className="mb-2">
            {t("errorSavingForm.description")}{" "}
            <StyledLink href={supportHref}>{t("errorSavingForm.supportLink")}.</StyledLink>
          </p>
          <p className="mb-5 text-sm">
            {errorCode && t("errorSavingForm.errorCode", { code: errorCode })}
          </p>
          <DownloadFileButton showInfo={false} autoShowDialog={false} />
        </Alert.Danger>
      )}

      {!userCanPublish && hasHydrated && (
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
          {hasHydrated ? <Icon checked={title} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit#formTitle`}>{t("formTitle")}</Link>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={questions} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit`}>{t("questions")}</Link>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={privacyPolicy} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit#privacy-text`}>
            {t("privacyStatement")}
          </Link>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={confirmationMessage} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit#confirmation-text`}>
            {t("formConfirmationMessage")}
          </Link>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={translate} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit/translate`}>{t("translate")}</Link>
        </li>

        <li className="my-4">
          {hasHydrated ? <Icon checked /> : IconLoading}
          <strong>
            {securityAttributeText}
            {t("publishYourFormInstructions.text2")},{" "}
          </strong>
          {isVaultDelivery(getDeliveryOption()) ? (
            <span>{t("publishYourFormInstructions.vaultOption")}</span>
          ) : (
            <span>{t("publishYourFormInstructions.emailOption")}</span>
          )}
          <StyledLink href={`/${i18n.language}/form-builder/${id}/settings`}>
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
  );
};
