import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store";
import { Radio, Button } from "./shared";
import { usePublish } from "../hooks";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const SetResponseDelivery = () => {
  const { t } = useTranslation("form-builder");
  const { updateResponseDelivery } = usePublish();

  const { email, id, resetDeliveryOption } = useTemplateStore((s) => ({
    id: s.id,
    email: s.deliveryOption?.emailAddress,
    resetDeliveryOption: s.resetDeliveryOption,
  }));

  const [deliveryOption, setDeliveryOption] = useState(
    !email ? DeliveryOption.vault : DeliveryOption.email
  );

  const saveDeliveryOption = useCallback(async () => {
    updateResponseDelivery(id);

    if (deliveryOption === DeliveryOption.vault) {
      resetDeliveryOption();
      return;
    }
  }, [deliveryOption, id, updateResponseDelivery, resetDeliveryOption]);

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

        <Button theme="secondary" onClick={saveDeliveryOption}>
          Change delivery option
        </Button>
      </div>
    </>
  );
};
