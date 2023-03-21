import React, { useCallback, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { useTemplateStore } from "../store";
import { Radio, Button } from "./shared";
import { usePublish } from "../hooks";
import { ResponseEmail } from "./ResponseEmail";
import { isValidGovEmail } from "@lib/validation";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const SetResponseDelivery = () => {
  const { t } = useTranslation("form-builder");
  const { updateResponseDelivery, uploadJson } = usePublish();
  const { status } = useSession();

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

  const setToDatabaseDelivery = useCallback(async () => {
    resetDeliveryOption();
    return await updateResponseDelivery(id);
  }, [id, resetDeliveryOption, updateResponseDelivery]);

  const setToEmailDelivery = useCallback(async () => {
    if (!isValidGovEmail(inputEmail)) return false;
    updateField(`deliveryOption.emailAddress`, inputEmail);
    return await uploadJson(getSchema(), getName(), getDeliveryOption(), id);
  }, [inputEmail, id, uploadJson, getSchema, getName, getDeliveryOption, updateField]);

  const saveDeliveryOption = useCallback(async () => {
    let result;

    if (email !== "" && deliveryOption === DeliveryOption.vault)
      result = await setToDatabaseDelivery();
    else result = await setToEmailDelivery();

    if (!result || axios.isAxiosError(result)) {
      toast.error(t("settingsDeliveryError"), {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
      });

      return;
    }

    toast.success(t("settingsDeliverySuccess"), {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
    });
  }, [deliveryOption, email, setToDatabaseDelivery, setToEmailDelivery, t]);

  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOption(value as DeliveryOption);
  }, []);

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      {status === "authenticated" && (
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
            <ResponseEmail inputEmail={inputEmail} setInputEmail={setInputEmail} />
          )}

          <Button
            disabled={initialDeliveryOption === deliveryOption}
            theme="secondary"
            onClick={saveDeliveryOption}
          >
            Save changes
          </Button>
        </div>
      )}
      <div className="sticky top-0">
        <ToastContainer />
      </div>
    </>
  );
};
