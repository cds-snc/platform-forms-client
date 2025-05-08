"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { toast } from "@formBuilder/components/shared/Toast";
import { ResponsibilityList } from "./ResponsibilityList";
import { ConfirmationAgreement } from "./ConfirmationAgreement";
import { Note } from "./Note";
import { downloadKey, _createKey } from "@formBuilder/[id]/settings/components/utils";
import { SubmitButton as DownloadButton } from "@clientComponents/globals/Buttons/SubmitButton";
import * as Alert from "@clientComponents/globals/Alert/Alert";
import { logMessage } from "@lib/logger";
import { sendResponsesToVault } from "@formBuilder/actions";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { GenerateKeySuccess } from "./GenerateKeySuccess";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { type SecurityAttribute } from "@lib/types";
import { type FormServerError } from "@lib/types/form-builder-types";

import { updateTemplateSecurityAttribute } from "@formBuilder/actions";

type APIKeyCustomEventDetails = {
  id: string;
  classification: SecurityAttribute;
};

/**
 * API Key Dialog
 * @param isVaultDelivery - boolean - Allows skipping the save request when a form is already saving to the vault -- example a live form swapping to API mode
 * @returns JSX.Element
 */
export const ApiKeyDialog = ({ isVaultDelivery = false }: { isVaultDelivery?: boolean }) => {
  const dialog = useDialogRef();
  const { Event } = useCustomEvent();
  const { t } = useTranslation("form-builder");

  const { resetDeliveryOption, getSecurityAttribute, updateSecurityAttribute } = useTemplateStore(
    (s) => ({
      resetDeliveryOption: s.resetDeliveryOption,
      getSecurityAttribute: s.getSecurityAttribute,
      updateSecurityAttribute: s.updateSecurityAttribute,
    })
  );

  // Setup + Open dialog
  const [id, setId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [classification, setClassification] = useState<string>("");

  const { updateApiKeyId } = useFormBuilderConfig();

  // Handle loading state for download button
  const [generating, setGenerating] = useState(false);

  const [hasError, setHasError] = useState(false);

  const handleOpen = useCallback((detail: APIKeyCustomEventDetails) => {
    if (detail) {
      detail.id && setId(detail.id);
      detail.classification && setClassification(detail.classification);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    Event.on(EventKeys.openApiKeyDialog, handleOpen);
    return () => {
      Event.off(EventKeys.openApiKeyDialog, handleOpen);
    };
  }, [Event, handleOpen]);

  // Handle Agreement - state
  const [agreed, setAgreed] = useState(false);

  const hasAgreed = (value: string) => {
    if (value === "AGREE" || value === "ACCEPTE") {
      setAgreed(true);
    } else {
      setAgreed(false);
    }
  };

  // Actions
  const handleClose = () => {
    dialog.current?.close();
    setHasError(false);
    setIsOpen(false);
  };

  const handleSave = async () => {
    setHasError(false);
    setGenerating(true);
    try {
      /*
        Allows skipping the save request
        if it's determined that the form responses 
        are already being delivered to the vault
      */
      if (!isVaultDelivery) {
        const result = await sendResponsesToVault({
          id: id,
        });

        // Check local state vs template store state
        if (classification && getSecurityAttribute() !== classification) {
          const securityAttribute = classification as SecurityAttribute;

          // Update the security attribute database
          const result = (await updateTemplateSecurityAttribute({
            id,
            securityAttribute,
          })) as FormServerError;

          // Sync the template store
          updateSecurityAttribute(securityAttribute);

          if (result.error) {
            // Throw the generic key creation error
            // Handling as generic as we're in the process of creating a key
            throw new Error(result.error);
          }
        }

        if (result.error) {
          // Throw the generic key creation error
          // Handling as generic as we're in the process of creating a key
          throw new Error(result.error);
        }

        // Sync the template store with the new delivery option
        resetDeliveryOption();
      }

      const key = await _createKey(id);
      await downloadKey(JSON.stringify(key), id);

      setGenerating(false);
      updateApiKeyId(key.keyId);
      toast.success(<GenerateKeySuccess />, "wide");
      dialog.current?.close();
      setIsOpen(false);
    } catch (error) {
      logMessage.error(error);
      setHasError(true);
      setGenerating(false);
    }
  };

  const actions = (
    <>
      <Button theme="secondary" onClick={handleClose}>
        {t("settings.api.dialog.cancelButton")}
      </Button>
      <DownloadButton
        loading={generating}
        className={cn("ml-5")}
        theme="primary"
        disabled={!agreed || generating}
        onClick={handleSave}
        dataTestId="confirm-download"
      >
        {t("settings.api.dialog.downloadButton")}
      </DownloadButton>
    </>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          handleClose={handleClose}
          dialogRef={dialog}
          actions={actions}
          title={t("settings.api.dialog.title")}
        >
          <div className="p-5">
            {hasError && (
              <Alert.Danger className="mb-4">
                <Alert.Title headingTag="h3">
                  {t("settings.api.dialog.error.createFailed.title")}
                </Alert.Title>
                <p className="mb-2">{t("settings.api.dialog.error.createFailed.message")} </p>
              </Alert.Danger>
            )}
            <h3 className="mb-4">{t("settings.api.dialog.heading")}</h3>
            <ResponsibilityList />
            <ConfirmationAgreement handleAgreement={hasAgreed} />
            <Note />
          </div>
        </Dialog>
      )}
    </>
  );
};
