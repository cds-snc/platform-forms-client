import { useTranslation } from "@i18n/client";
import Skeleton from "react-loading-skeleton";

import { useRehydrate } from "@lib/store/hooks/useRehydrate";
import { isVaultDelivery } from "@lib/utils/form-builder";
import { useAllowPublish } from "@lib/hooks/form-builder/useAllowPublish";
import { Language } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";

import { CancelIcon, CircleCheckIcon } from "@serverComponents/icons";
import { classificationOptions } from "@formBuilder/components/ClassificationSelect";

import { CheckListLink } from "./CheckListLink";

// Add an index signature to the ClassificationOption type to allow indexing with a string
interface ClassificationOption {
  [key: string]: string;
  value: string;
}

const IconLoading = (
  <Skeleton
    inline
    circle={true}
    width={36}
    height={36}
    className="my-2 mr-2 inline-block w-9 align-middle"
  />
);

const Icon = ({ checked }: { checked: boolean }) => {
  return checked ? (
    <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
  ) : (
    <CancelIcon className="mr-2 inline-block size-9 fill-red-700" />
  );
};

export const CheckList = ({ formId, lang }: { formId: string; lang: Language }) => {
  const { t } = useTranslation("form-builder");
  const { formPurpose, securityAttribute, getDeliveryOption } = useTemplateStore((s) => ({
    formPurpose: s.formPurpose,
    securityAttribute: s.securityAttribute,
    getDeliveryOption: s.getDeliveryOption,
  }));

  const {
    data: {
      title,
      questions,
      privacyPolicy,
      translate,
      confirmationMessage,
      hasFileInputAndApiKey,
    },
    hasFileInputElement,
    hasApiKeyId,
  } = useAllowPublish();

  let formPurposeText = t("settingsPurposeAndUse.purpose.unset");
  if (formPurpose === "admin") {
    formPurposeText = t("settingsPurposeAndUse.purpose.admin");
  }
  if (formPurpose === "nonAdmin") {
    formPurposeText = t("settingsPurposeAndUse.purpose.nonAdmin");
  }

  const securityOption: ClassificationOption | undefined = classificationOptions.find(
    (item) => item.value === securityAttribute
  );

  let securityAttributeText: string = securityOption?.[lang] || securityAttribute;
  // remove (default) from the string
  securityAttributeText = securityAttributeText.replace(/\(.*?\)/g, "");

  const hasHydrated = useRehydrate();

  return (
    <ul className="list-none p-0">
      <li className="my-4">
        {hasHydrated ? <Icon checked={title} /> : IconLoading}
        <CheckListLink href={`/${lang}/form-builder/${formId}/edit#formTitle`}>
          {t("formTitle")}
        </CheckListLink>
      </li>

      <li className="my-4">
        {hasHydrated ? <Icon checked={questions} /> : IconLoading}
        <CheckListLink href={`/${lang}/form-builder/${formId}/edit#questions`}>
          {t("questions")}
        </CheckListLink>
      </li>

      <li className="my-4">
        {hasHydrated ? <Icon checked={privacyPolicy} /> : IconLoading}
        <CheckListLink href={`/${lang}/form-builder/${formId}/edit#privacy-text`}>
          {t("privacyStatement")}
        </CheckListLink>
      </li>

      <li className="my-4">
        {hasHydrated ? <Icon checked={confirmationMessage} /> : IconLoading}
        <CheckListLink href={`/${lang}/form-builder/${formId}/edit#confirmation-text`}>
          {t("formConfirmationMessage")}
        </CheckListLink>
      </li>

      <li className="my-4">
        {hasHydrated ? <Icon checked={translate} /> : IconLoading}
        <CheckListLink href={`/${lang}/form-builder/${formId}/edit/translate`}>
          {t("translate")}
        </CheckListLink>
      </li>

      {hasFileInputElement && (
        <li className="my-4">
          {hasHydrated ? <Icon checked={hasFileInputAndApiKey} /> : IconLoading}
          <CheckListLink href={`/${lang}/form-builder/${formId}/settings`}>
            {t("hasFileInputAndApiDelivery")}
          </CheckListLink>
          <ul>
            <li>{t("hasFileInputAndApiDeliveryNote")}</li>
          </ul>
        </li>
      )}

      <li className="my-4">
        {hasHydrated ? <Icon checked={formPurpose != ""} /> : IconLoading}
        <CheckListLink href={`/${lang}/form-builder/${formId}/settings`}>
          {t("publishYourFormInstructions.settings")}
        </CheckListLink>
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
  );
};
