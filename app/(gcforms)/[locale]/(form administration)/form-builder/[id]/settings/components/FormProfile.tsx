"use client";
import React, { useCallback, useState } from "react";
import Markdown from "markdown-to-jsx";
import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";

import { FormServerError, FormServerErrorCodes } from "@lib/types/form-builder-types";

import { updateTemplateSecurityAttribute, updateTemplateFormPurpose } from "@formBuilder/actions";

import { useRefresh } from "@lib/hooks/useRefresh";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";

import { toast } from "@formBuilder/components/shared/Toast";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { FormPurposeHelpButton } from "./dialogs/FormPurposeHelpButton";
import { Branding } from "./branding/Branding";
import { DownloadForm } from "./DownloadForm";
import { SetSaveAndResume } from "../manage/saveAndResume/SetSaveAndResume";

/*
 * PurposeOption is used to determine the purpose of the form
 * admin: The form is used to collect personal information
 * nonAdmin: The form is used to collect non-personal information
 */
export enum PurposeOption {
  none = "",
  admin = "admin",
  nonAdmin = "nonAdmin",
}

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
        <div className="mb-10">
          <div className="mb-10">
            <h2 className="mb-6">{t("settingsResponseDelivery.selectClassification")}</h2>

            {/*--------------------------------------------*
             * Classification section
             *--------------------------------------------*/}
            <div className="mb-10">
              <ClassificationSelect
                className="max-w-[400px] truncate bg-gray-soft p-1 pr-10"
                lang={lang}
                isPublished={isPublished}
                classification={classification}
                handleUpdateClassification={saveSecurityAttribute}
              />
            </div>

            {/*--------------------------------------------*
             * Branding section
             *--------------------------------------------*/}
            <div className="mb-10">
              <Branding hasBrandingRequestForm={hasBrandingRequestForm} />
            </div>

            {/*--------------------------------------------*
             * Purpose option section
             *--------------------------------------------*/}

            <div className="mb-10">
              <h2>{t("settingsPurposeAndUse.title")}</h2>
              <p className="mb-2">
                <strong>{t("settingsPurposeAndUse.helpUs")}</strong>
              </p>
              <p className="mb-6 text-sm">{t("settingsPurposeAndUse.description")}</p>
              <Radio
                id="purposeAndUseAdmin"
                name="purpose-use"
                label={t("settingsPurposeAndUse.personalInfo")}
                disabled={isPublished}
                checked={purposeOption === PurposeOption.admin}
                value={PurposeOption.admin}
                onChange={saveFormPurpose}
                className="mb-20"
              />
              <div className="mb-4 ml-12 text-sm">
                <div>
                  <Markdown options={{ forceBlock: false }}>
                    {t("settingsPurposeAndUse.personalInfoDetails")}
                  </Markdown>
                </div>
                <ul>
                  <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.1")}</li>
                  <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.2")}</li>
                  <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.3")}</li>
                </ul>
              </div>
              <Radio
                id="purposeAndUseNonAdmin"
                name="purpose-use"
                label={t("settingsPurposeAndUse.nonAdminInfo")}
                disabled={isPublished}
                checked={purposeOption === PurposeOption.nonAdmin}
                value={PurposeOption.nonAdmin}
                onChange={saveFormPurpose}
              />
              <div className="mb-4 ml-12 text-sm">
                <div>
                  <Markdown options={{ forceBlock: false }}>
                    {t("settingsPurposeAndUse.nonAdminInfoDetails")}
                  </Markdown>
                </div>
                <ul>
                  <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.1")}</li>
                  <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.2")}</li>
                  <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.3")}</li>
                </ul>
              </div>
            </div>
            <FormPurposeHelpButton />
          </div>

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
