"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { LockIcon } from "@serverComponents/icons";
import { Button, Alert } from "@clientComponents/globals";

import { logMessage } from "@lib/logger";
import { DownloadFileButton } from "@formBuilder/components/shared/DownloadFileButton";
import { toast } from "@formBuilder/components/shared/Toast";

import LinkButton from "@serverComponents/globals/Buttons/LinkButton";
import { updateTemplate, updateTemplatePublishedStatus } from "@formBuilder/actions";
import { useAllowPublish } from "@lib/hooks/form-builder/useAllowPublish";
import { safeJSONParse } from "@lib/utils";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { FormServerErrorCodes, Language } from "@lib/types/form-builder-types";
import { PrePublishDialog } from "../PrePublishDialog";
import { FormProperties } from "@lib/types";
import { ga } from "@lib/client/clientHelpers";
import { CheckList } from "./CheckList";

export const Publish = ({ id }: { id: string }) => {
  const { t, i18n } = useTranslation("form-builder");
  const router = useRouter();
  const { userCanPublish, isPublishable } = useAllowPublish();

  const [error, setError] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorCode, setErrorCode] = useState<null | number>(null);
  const {
    id: storeId,
    setId,
    setIsPublished,
    getSchema,
    getName,
  } = useTemplateStore((s) => ({
    id: s.id,
    setId: s.setId,
    setIsPublished: s.setIsPublished,
    getSchema: s.getSchema,
    getName: s.getName,
  }));

  if (storeId && storeId !== id) {
    id = storeId;
  }

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

  const handlePublish = async () => {
    setError(false);
    setErrorCode(null);
    setPublishing(true);

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

      // Note we don't reset setPublishing(false) here as we're navigating away
      ga("publish_form");
      router.replace(`/${i18n.language}/form-builder/${id}/published`);
    } catch (e) {
      logMessage.error(e);
      setError(true);
      setErrorCode(500);
      setPublishing(false);
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

      <CheckList lang={i18n.language as Language} formId={id} />

      {userCanPublish && isPublishable() && (
        <>
          <Button
            disabled={publishing || showPrePublishDialog}
            className="mt-5"
            onClick={handleOpenPrePublish}
          >
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
