"use client";
import React, { useCallback, useState } from "react";

import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";

import { toast } from "@formBuilder/components/shared/Toast";
import { updateTemplateSecurityAttribute, updateTemplateFormPurpose } from "@formBuilder/actions";
import { FormServerError, FormServerErrorCodes } from "@lib/types/form-builder-types";

import { useRefresh } from "@lib/hooks/useRefresh";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";

import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";

import { Branding } from "./branding/Branding";
import { DownloadForm } from "./DownloadForm";
import { SetSaveAndResume } from "./saveAndResume/SetSaveAndResume";

import { IntendedUse, PurposeOption } from "./intendedUse/IntendedUse";

export const FormProfile = ({ hasBrandingRequestForm }: { hasBrandingRequestForm: boolean }) => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const { refreshData } = useRefresh();
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
      // Update local state
      setClassification(classification);

      updateSecurityAttribute(classification);

      const resultAttribute = (await updateTemplateSecurityAttribute({
        id,
        securityAttribute: classification,
      })) as FormServerError;

      if (resultAttribute?.error) {
        toast.error(<ErrorSaving errorCode={FormServerErrorCodes.DELIVERY_OPTION} />, "wide");
        return;
      }

      toast.success(savedSuccessMessage);

      refreshData && refreshData();
    },
    [savedSuccessMessage, refreshData, id, updateSecurityAttribute]
  );

  /*--------------------------------------------*
   * Save form purpose option
   *--------------------------------------------*/

  const saveFormPurpose = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const purposeOption = value as PurposeOption;

      // Update local state
      setPurposeOption(purposeOption);

      // Update the template store
      updateField("formPurpose", purposeOption);

      // Update the database
      const result = await updateTemplateFormPurpose({
        id,
        formPurpose: purposeOption,
      });

      if (result?.error) {
        toast.error(<ErrorSaving errorCode={FormServerErrorCodes.FORM_PURPOSE} />, "wide");
        return;
      }

      toast.success(savedSuccessMessage);

      refreshData && refreshData();
    },
    [savedSuccessMessage, refreshData, id, updateField]
  );

  return (
    <>
      {status === "authenticated" && (
        <div className="mb-10 w-7/12">
          {/*--------------------------------------------*
           * Classification section
           *--------------------------------------------*/}
          <ClassificationSelect
            className="max-w-[400px] truncate bg-gray-soft p-1 pr-10"
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
          <DownloadForm />
        </div>
      )}
    </>
  );
};
