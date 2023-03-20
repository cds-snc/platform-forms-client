import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store";
import { Radio } from "./shared";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const SetResponseDelivery = () => {
  const { t } = useTranslation("form-builder");

  const { email, resetDeliveryOption } = useTemplateStore((s) => ({
    email: s.deliveryOption?.emailAddress,
    resetDeliveryOption: s.resetDeliveryOption,
  }));

  const [deliveryOption, setDeliveryOption] = useState(
    !email ? DeliveryOption.vault : DeliveryOption.email
  );

  const updateDeliveryOption = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      setDeliveryOption(value as DeliveryOption);

      if (value === "vault") {
        resetDeliveryOption();
        return;
      }
    },
    [resetDeliveryOption]
  );

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      {email}
      <div className="mb-10">
        <div className="block font-bold mb-1">Select a response delivery option </div>
        <Radio
          checked={deliveryOption === DeliveryOption.vault}
          name="response-delivery"
          value={DeliveryOption.vault}
          label="Download responses from GC Forms"
          onChange={updateDeliveryOption}
        />

        <Radio
          checked={deliveryOption === DeliveryOption.email}
          name="response-delivery"
          value={DeliveryOption.email}
          label="Email the responses to an inbox"
          onChange={updateDeliveryOption}
        />
      </div>
    </>
  );
};
