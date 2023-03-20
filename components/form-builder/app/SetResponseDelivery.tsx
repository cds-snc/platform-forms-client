import React, { useCallback, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store";
import { Input, Radio, Button } from "./shared";
import { usePublish } from "../hooks";

import { isValidGovEmail } from "@lib/validation";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="block text-sm mb-1" id={id}>
      {children}
    </span>
  );
};

const InvalidEmailError = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { t, i18n } = useTranslation("form-builder");

  return (
    <div id={id} className="mt-2 mb-2" role="alert">
      {isActive && (
        <>
          <h2 className="text-red text-sm font-bold pb-1">{t("settingsInvalidEmailAlertTitle")}</h2>
          <div className="bg-red-100 w-3/5 text-sm p-2">
            <span>{t("settingsInvalidEmailAlertDesc1")}</span>
            <br />
            <a href={`/${i18n.language}/form-builder/support`} target="_blank" rel="noreferrer">
              {t("contactSupport")}
            </a>
            <span> {t("settingsInvalidEmailAlertDesc2")}</span>
          </div>
        </>
      )}
    </div>
  );
};

export const SetResponseDelivery = () => {
  const { t } = useTranslation("form-builder");
  const { updateResponseDelivery, uploadJson } = usePublish();

  const { email, id, resetDeliveryOption, getSchema, getName, getDeliveryOption, updateField } =
    useTemplateStore((s) => ({
      id: s.id,
      email: s.deliveryOption?.emailAddress,
      resetDeliveryOption: s.resetDeliveryOption,
      getSchema: s.getSchema,
      getName: s.getName,
      getDeliveryOption: s.getDeliveryOption,
      updateField: s.updateField,
    }));

  const initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;
  const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);

  const [inputEmail, setInputEmail] = useState(email ?? "");
  const [IsInvalidEmailErrorActive, setIsInvalidEmailErrorActive] = useState(false);

  const handleEmailChange = (email: string) => {
    setInputEmail(email);

    const completeEmailAddressRegex =
      /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.])+@([a-zA-Z0-9-.]+)\.([a-zA-Z0-9]{2,})+$/;

    // We want to make sure the email address is complete before validating it
    if (!completeEmailAddressRegex.test(email)) {
      setIsInvalidEmailErrorActive(false);
      return;
    }

    if (isValidGovEmail(email)) {
      setIsInvalidEmailErrorActive(false);
    } else {
      setIsInvalidEmailErrorActive(true);
    }
  };

  const saveDeliveryOption = useCallback(async () => {
    const position = toast.POSITION.TOP_CENTER;

    if (email !== "" && deliveryOption === DeliveryOption.vault) {
      // reset local store
      resetDeliveryOption();

      // reset database
      const result = await updateResponseDelivery(id);

      if (result) {
        toast.success("success", { position });
        return;
      }
      return;
    }

    if (!isValidGovEmail(inputEmail)) {
      setIsInvalidEmailErrorActive(true);
      return;
    }

    updateField(`deliveryOption.emailAddress`, inputEmail);

    const result = await uploadJson(getSchema(), getName(), getDeliveryOption(), id);
    if (result) {
      toast.success("success", { position });
    }
  }, [
    deliveryOption,
    id,
    updateResponseDelivery,
    resetDeliveryOption,
    uploadJson,
    getSchema,
    getName,
    getDeliveryOption,
    inputEmail,
    updateField,
    email,
  ]);

  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOption(value as DeliveryOption);
  }, []);

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <div className="mb-10">
        <div className="block font-bold mb-4">Select a response delivery option </div>
        <div className="mb-4">
          <Radio
            id={`delivery-option-${DeliveryOption.vault}`}
            checked={deliveryOption === DeliveryOption.vault}
            name="response-delivery"
            value={DeliveryOption.vault}
            label="Download responses from GC Forms"
            onChange={updateDeliveryOption}
          />
          <Radio
            id={`delivery-option-${DeliveryOption.email}`}
            checked={deliveryOption === DeliveryOption.email}
            name="response-delivery"
            value={DeliveryOption.email}
            label="Email the responses to an inbox"
            onChange={updateDeliveryOption}
          />
        </div>

        {deliveryOption === DeliveryOption.email && (
          <div className="mb-10 pl-8 border-l-4 ml-4 ">
            <InvalidEmailError id="invalidEmailError" isActive={IsInvalidEmailErrorActive} />
            <div className="block font-bold mb-1 text-sm">{t("settingsResponseEmailTitle")}</div>
            <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
            <Input
              id="response-delivery"
              isInvalid={IsInvalidEmailErrorActive}
              describedBy="response-delivery-hint-1 response-delivery-hint-2 invalidEmailError"
              value={inputEmail}
              theme={IsInvalidEmailErrorActive ? "error" : "default"}
              className="w-3/5"
              onChange={(e) => handleEmailChange(e.target.value)}
            />
          </div>
        )}

        <Button
          disabled={initialDeliveryOption === deliveryOption}
          theme="secondary"
          onClick={saveDeliveryOption}
        >
          Save changes
        </Button>
      </div>

      <div className="sticky top-0">
        <ToastContainer />
      </div>
    </>
  );
};
