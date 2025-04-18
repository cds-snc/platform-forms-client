"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { CancelIcon, CircleCheckIcon, LockIcon } from "@serverComponents/icons";
import { Button, Alert } from "@clientComponents/globals";
import Link from "next/link";
import { isVaultDelivery } from "@lib/utils/form-builder";
import { classificationOptions } from "@formBuilder/components/ClassificationSelect";
import { logMessage } from "@lib/logger";
import { DownloadFileButton } from "@formBuilder/components/shared/DownloadFileButton";
import { toast } from "@formBuilder/components/shared/Toast";
import Skeleton from "react-loading-skeleton";
import LinkButton from "@serverComponents/globals/Buttons/LinkButton";
import { updateTemplate, updateTemplatePublishedStatus } from "@formBuilder/actions";
import { useAllowPublish } from "@lib/hooks/form-builder/useAllowPublish";
import { safeJSONParse } from "@lib/utils";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { PrePublishDialog } from "./PrePublishDialog";
import { FormProperties } from "@lib/types";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { ga } from "@lib/client/clientHelpers";

export const Publish = ({ id }: { id: string }) => {
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

  const {
    id: storeId,
    setId,
    setIsPublished,
    getSchema,
    getName,
    formPurpose,
    getDeliveryOption,
    securityAttribute,
    getGroupsEnabled,
  } = useTemplateStore((s) => ({
    id: s.id,
    setId: s.setId,
    setIsPublished: s.setIsPublished,
    getSchema: s.getSchema,
    getName: s.getName,
    formPurpose: s.formPurpose,
    getDeliveryOption: s.getDeliveryOption,
    securityAttribute: s.securityAttribute,
    getGroupsEnabled: s.getGroupsEnabled,
  }));

  if (storeId && storeId !== id) {
    id = storeId;
  }

  const setGroupId = useGroupStore((state) => state.setId);

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

  const { hasApiKeyId } = useFormBuilderConfig();

  const Icon = ({ checked }: { checked: boolean }) => {
    return checked ? (
      <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
    ) : (
      <CancelIcon className="mr-2 inline-block size-9 fill-red-700" />
    );
  };

  const supportHref = `/${i18n.language}/support`;

  const [showPrePublishDialog, setShowPrePublishDialog] = useState(false);

  const [formType, setFormType] = useState("");
  const [description, setDescription] = useState("");
  const [reasonForPublish, setReasonForPublish] = useState("");

  const handleOpenPrePublish = async () => {
    setShowPrePublishDialog(true);
  };

  const handlePrePublishClose: () => void = async () => {
    setDescription("");
    setReasonForPublish("");
    setFormType("");
    setShowPrePublishDialog(false);
  };

  const handlePrePublish = async () => {
    setShowPrePublishDialog(false);
    handlePublish();
  };

  let formPurposeText = t("settingsPurposeAndUse.purpose.unset");
  if (formPurpose === "admin") {
    formPurposeText = t("settingsPurposeAndUse.purpose.admin");
  }
  if (formPurpose === "nonAdmin") {
    formPurposeText = t("settingsPurposeAndUse.purpose.nonAdmin");
  }

  const handlePublish = async () => {
    setError(false);
    setErrorCode(null);
    try {
      const { formRecord, error } = await updateTemplatePublishedStatus({
        id,
        isPublished: true,
        publishFormType: formType,
        publishDescription: description,
        publishReason: reasonForPublish,
      });
      if (error || !formRecord) {
        throw new Error(error);
      }
      setId(formRecord?.id);
      setIsPublished(formRecord?.isPublished);

      ga("publish_form");
      router.replace(`/${i18n.language}/form-builder/${id}/published`);
    } catch (e) {
      logMessage.error(e);
      setError(true);
      setErrorCode(500);
    }
  };

  const handleSaveAndRequest = useCallback(async () => {
    setError(false);
    setErrorCode(null);

    const formConfig = safeJSONParse<FormProperties>(getSchema());
    if (!formConfig) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
      return;
    }

    try {
      const operationResult = await updateTemplate({
        id,
        name: getName(),
        formConfig,
      });

      if (operationResult.formRecord === null) {
        throw new Error("Failed to publish form");
      }

      router.push(`/${i18n.language}/unlock-publishing`);
    } catch (e) {
      logMessage.error(e);
      setError(true);
      setErrorCode(500);
      return;
    }
  }, [getSchema, getName, id, router, i18n.language]);

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

  const routeToPrivacy = () => {
    if (getGroupsEnabled()) {
      setGroupId("start");
    }
    router.push(`/${i18n.language}/form-builder/${id}/edit#privacy-text`);
  };

  const routeToFormTitle = () => {
    if (getGroupsEnabled()) {
      setGroupId("start");
    }
    router.push(`/${i18n.language}/form-builder/${id}/edit#formTitle`);
  };

  const routeToConfirmation = () => {
    if (getGroupsEnabled()) {
      setGroupId("end");
    }
    router.push(`/${i18n.language}/form-builder/${id}/edit#confirmation-text`);
  };

  return (
    <div>
      {!userCanPublish && error && hasHydrated && (
        <Alert.Danger focussable={true} className="mb-5">
          <Alert.Title headingTag="h3">{t("errorSavingForm.title")}</Alert.Title>
          <p className="mb-2">
            {t("errorSavingForm.description")}{" "}
            <LinkButton href={supportHref}>
              <>{t("errorSavingForm.supportLink")}.</>
            </LinkButton>
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

      {userCanPublish && (
        <Alert.Warning className="my-5 max-w-4xl">
          <Alert.Title headingTag="h2">{t("logicPublishWarning.header")}</Alert.Title>
          <p className="mb-5">{t("logicPublishWarning.text")}</p>
        </Alert.Warning>
      )}

      <ul className="list-none p-0">
        <li className="my-4">
          {hasHydrated ? <Icon checked={title} /> : IconLoading}
          <Button theme={"link"} onClick={routeToFormTitle}>
            {t("formTitle")}
          </Button>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={questions} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit`}>{t("questions")}</Link>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={privacyPolicy} /> : IconLoading}
          <Button theme={"link"} onClick={routeToPrivacy}>
            {t("privacyStatement")}
          </Button>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={confirmationMessage} /> : IconLoading}
          <Button theme={"link"} onClick={routeToConfirmation}>
            {t("formConfirmationMessage")}
          </Button>
        </li>
        <li className="my-4">
          {hasHydrated ? <Icon checked={translate} /> : IconLoading}
          <Link href={`/${i18n.language}/form-builder/${id}/edit/translate`}>{t("translate")}</Link>
        </li>

        <li className="my-4">
          {hasHydrated ? <Icon checked={formPurpose != ""} /> : IconLoading}
          <strong>
            <LinkButton href={`/${i18n.language}/form-builder/${id}/settings`}>
              {t("publishYourFormInstructions.settings")}
            </LinkButton>
          </strong>
          <div>
            <ul>
              <li>
                <strong>{t("publishYourFormInstructions.classification")}:&nbsp;</strong>
                {securityAttributeText}
                {t("publishYourFormInstructions.text2")}
              </li>
              <li>
                <strong>{t("publishYourFormInstructions.deliveryOption")}:&nbsp;</strong>
                {isVaultDelivery(getDeliveryOption()) ? (
                  <>
                    {hasApiKeyId ? (
                      <span>{t("publishYourFormInstructions.apiOption")}</span>
                    ) : (
                      <span>{t("publishYourFormInstructions.vaultOption")}</span>
                    )}
                  </>
                ) : (
                  <span>
                    {t("publishYourFormInstructions.emailOption")}
                    {getDeliveryOption()?.emailAddress}
                  </span>
                )}
              </li>
              <li>
                <strong>{t("publishYourFormInstructions.purpose")}:&nbsp;</strong>
                {formPurposeText}
              </li>
            </ul>
          </div>
        </li>
      </ul>

      {userCanPublish && isPublishable() && (
        <>
          <Button className="mt-5" onClick={handleOpenPrePublish}>
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

      {showPrePublishDialog && (
        <PrePublishDialog
          setDescription={setDescription}
          setFormType={setFormType}
          description={description}
          formType={formType}
          reasonForPublish={reasonForPublish}
          setReasonForPublish={setReasonForPublish}
          handleClose={() => handlePrePublishClose()}
          handleConfirm={() => handlePrePublish()}
        />
      )}
    </div>
  );
};
