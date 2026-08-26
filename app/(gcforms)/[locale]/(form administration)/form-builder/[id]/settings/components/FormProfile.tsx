"use client";
import React, { useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";

import { toast } from "@formBuilder/components/shared/Toast";
import { updateTemplate } from "@formBuilder/actions";
import { FormServerError, FormServerErrorCodes } from "@lib/types/form-builder-types";

import { useTemplateStore } from "@lib/store/useTemplateStore";

import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";

import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";

import { Branding } from "./branding/Branding";
import { DownloadForm } from "./DownloadForm";
import { type DownloadableTemplateVersion } from "@lib/templates/types";
import { SetSaveAndResume } from "./saveAndResume/SetSaveAndResume";
import { AuditForm } from "./AuditForm";

import { IntendedUse, PurposeOption } from "./intendedUse/IntendedUse";
import { UpdateTemplateAction } from "@lib/templates/types";

export const FormProfile = ({
  hasBrandingRequestForm,
  versions,
}: {
  hasBrandingRequestForm: boolean;
  versions: DownloadableTemplateVersion[];
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const lang = i18n.language === "en" ? "en" : "fr";

  const { id, formPurpose, updateField, securityAttribute, updateSecurityAttribute, isPublished } =
    useTemplateStore((s) => ({
      id: s.id,
      email: s.deliveryOption?.emailAddress,
      formPurpose: s.formPurpose,
      updateField: s.updateField,
      securityAttribute: s.securityAttribute,
      updateSecurityAttribute: s.updateSecurityAttribute,
      isPublished: s.isPublished,
    }));

  const [classification, setClassification] = useState<ClassificationType>(
    securityAttribute ? (securityAttribute as ClassificationType) : "Protected A"
  );

  const [purposeOption, setPurposeOption] = useState(formPurpose as PurposeOption);

  const savedSuccessMessage = t("settingsResponseDelivery.savedSuccessMessage");

  /*--------------------------------------------*
   * Save security attribute
   *--------------------------------------------*/

  const saveSecurityAttribute = useCallback(
    async (classification: ClassificationType) => {
      // Optimistic update: save previous state for rollback
      const prev = securityAttribute;

      // Update local state immediately
      setClassification(classification);

      try {
        const resultAttribute = (await updateTemplate({
          action: UpdateTemplateAction.SecurityAttribute,
          formId: id,
          securityAttribute: classification,
        })) as FormServerError;

        if (resultAttribute?.error) {
          throw new Error("Save failed");
        }

        // Update the template store after successful database update
        updateSecurityAttribute(classification);

        toast.success(savedSuccessMessage);
      } catch (err) {
        // Rollback local state on failure
        setClassification(prev ?? ("Protected A" as ClassificationType));
        toast.error(<ErrorSaving errorCode={FormServerErrorCodes.DELIVERY_OPTION} />, "wide");
      }
    },
    [savedSuccessMessage, id, updateSecurityAttribute, securityAttribute]
  );

  /*--------------------------------------------*
   * Save form purpose option
   *--------------------------------------------*/

  const saveFormPurpose = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const purposeOption = value as PurposeOption;
      // Optimistic update: save previous value for rollback
      const prev = formPurpose;

      // Update local state
      setPurposeOption(purposeOption);

      try {
        // Update the database
        const result = await updateTemplate({
          action: UpdateTemplateAction.FormPurpose,
          formId: id,
          formPurpose: purposeOption,
        });

        if (result?.error) {
          throw new Error("Save failed");
        }

        // Update the template store after successful database update
        updateField("formPurpose", purposeOption);

        toast.success(savedSuccessMessage);
      } catch (err) {
        // Rollback local state on failure
        setPurposeOption(prev as PurposeOption);
        toast.error(<ErrorSaving errorCode={FormServerErrorCodes.FORM_PURPOSE} />, "wide");
      }
    },
    [savedSuccessMessage, id, updateField, formPurpose]
  );

  return (
    <>
      {status === "authenticated" && (
        <div className="mb-10 w-7/12">
          {/*--------------------------------------------*
           * Classification section
           *--------------------------------------------*/}
          <ClassificationSelect
            className="bg-gray-soft max-w-[400px] truncate p-1 pr-10"
            lang={lang}
            isPublished={isPublished}
            classification={classification}
            handleUpdateClassification={saveSecurityAttribute}
          />

          {/*--------------------------------------------*
           * Branding section
           *--------------------------------------------*/}
          <Branding hasBrandingRequestForm={hasBrandingRequestForm} />

          {/*--------------------------------------------*
           * Purpose option section
           *--------------------------------------------*/}
          <IntendedUse
            purposeOption={purposeOption}
            isPublished={isPublished}
            onChange={saveFormPurpose}
          />

          {/*--------------------------------------------*
           * Save progress section
           *--------------------------------------------*/}
          <SetSaveAndResume formId={id} />

          {/*--------------------------------------------*
           * Download section
           *--------------------------------------------*/}
          <DownloadForm versions={versions} />

          {/*--------------------------------------------*
           * Audit Form section
           *--------------------------------------------*/}
          <AuditForm formId={id} />
        </div>
      )}
    </>
  );
};
