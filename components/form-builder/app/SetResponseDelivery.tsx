import React, { useCallback, useState, useMemo } from "react";
import { LocalizedFormProperties } from "../types";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import { useRefresh } from "@lib/hooks";
import { isValidGovEmail } from "@lib/validation";
import { ResponseEmail } from "./ResponseEmail";
import { Radio, Button, ResponseDeliveryHelpButton } from "./shared";
import { usePublish } from "../hooks";
import { useTemplateStore } from "../store";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const SetResponseDelivery = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const session = useSession();
  const { updateResponseDelivery, uploadJson } = usePublish();
  const { refreshData } = useRefresh();

  const {
    email,
    id,
    resetDeliveryOption,
    getSchema,
    getName,
    getDeliveryOption,
    updateField,
    subjectEn: initialSubjectEn,
    subjectFr: initialSubjectFr,
    defaultSubjectEn,
    defaultSubjectFr,
  } = useTemplateStore((s) => ({
    id: s.id,
    email: s.deliveryOption?.emailAddress,
    subjectEn: s.deliveryOption?.subjectEn,
    subjectFr: s.deliveryOption?.subjectFr,
    defaultSubjectEn: s.form[s.localizeField(LocalizedFormProperties.TITLE, "en")] + " - Response",
    defaultSubjectFr: s.form[s.localizeField(LocalizedFormProperties.TITLE, "fr")] + " - Réponse",
    resetDeliveryOption: s.resetDeliveryOption,
    getSchema: s.getSchema,
    getName: s.getName,
    getDeliveryOption: s.getDeliveryOption,
    updateField: s.updateField,
  }));

  const userEmail = session.data?.user.email ?? "";
  const initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;

  const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
  const [inputEmail, setInputEmail] = useState(email ? email : userEmail);
  const [subjectEn, setSubjectEn] = useState(
    initialSubjectEn ? initialSubjectEn : defaultSubjectEn
  );
  const [subjectFr, setSubjectFr] = useState(
    initialSubjectFr ? initialSubjectFr : defaultSubjectFr
  );
  const [isInvalidEmailError, setIsInvalidEmailError] = useState(false);

  const isValid = useMemo(() => {
    const isValidDeliveryOption =
      !isInvalidEmailError && inputEmail !== "" && subjectEn !== "" && subjectFr !== "";
    const emailDeliveryOptionsChanged =
      inputEmail !== email || subjectEn !== initialSubjectEn || subjectFr !== initialSubjectFr;

    if (deliveryOption === DeliveryOption.email) {
      return isValidDeliveryOption && emailDeliveryOptionsChanged;
    }

    if (deliveryOption === initialDeliveryOption) {
      return false;
    }

    return true;
  }, [
    deliveryOption,
    initialDeliveryOption,
    isInvalidEmailError,
    inputEmail,
    email,
    subjectEn,
    initialSubjectEn,
    subjectFr,
    initialSubjectFr,
  ]);

  const setToDatabaseDelivery = useCallback(async () => {
    setInputEmail("");
    resetDeliveryOption();
    return await updateResponseDelivery(id);
  }, [id, resetDeliveryOption, updateResponseDelivery, setInputEmail]);

  const setToEmailDelivery = useCallback(async () => {
    if (!isValidGovEmail(inputEmail)) return false;
    updateField("deliveryOption.emailAddress", inputEmail);
    updateField("deliveryOption.subjectEn", subjectEn);
    updateField("deliveryOption.subjectFr", subjectFr);
    return await uploadJson(getSchema(), getName(), getDeliveryOption(), id);
  }, [
    inputEmail,
    subjectEn,
    subjectFr,
    id,
    uploadJson,
    getSchema,
    getName,
    getDeliveryOption,
    updateField,
  ]);

  const saveDeliveryOption = useCallback(async () => {
    let result;

    if (email !== "" && deliveryOption === DeliveryOption.vault) {
      result = await setToDatabaseDelivery();
    } else {
      result = await setToEmailDelivery();
    }

    if (!result || axios.isAxiosError(result)) {
      toast.error(t("settingsResponseDelivery.savedErrorMessage"), {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
      });

      return;
    }

    toast.success(t("settingsResponseDelivery.savedSuccessMessage"), {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
    });

    refreshData && refreshData();
  }, [refreshData, deliveryOption, email, setToDatabaseDelivery, setToEmailDelivery, t]);

  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOption(value as DeliveryOption);
  }, []);

  const responsesLink = `/${i18n.language}/responses`;

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      {status === "authenticated" && (
        <div className="mb-10">
          <div className="block font-bold mb-4">{t("settingsResponseDelivery.title")}</div>
          <div className="mb-4">
            <Radio
              id={`delivery-option-${DeliveryOption.vault}`}
              checked={deliveryOption === DeliveryOption.vault}
              name="response-delivery"
              value={DeliveryOption.vault}
              label={t("settingsResponseDelivery.vaultOption")}
              onChange={updateDeliveryOption}
            >
              <span className="block ml-3 text-sm mb-1">
                {t("settingsResponseDelivery.vaultOptionHint.text1")}{" "}
                <a href={responsesLink}>{t("settingsResponseDelivery.vaultOptionHint.text2")}.</a>
              </span>
            </Radio>
            <Radio
              id={`delivery-option-${DeliveryOption.email}`}
              checked={deliveryOption === DeliveryOption.email}
              name="response-delivery"
              value={DeliveryOption.email}
              label={t("settingsResponseDelivery.emailOption")}
              onChange={updateDeliveryOption}
            />
          </div>

          {deliveryOption === DeliveryOption.email && (
            <ResponseEmail
              inputEmail={inputEmail}
              setInputEmail={setInputEmail}
              subjectEn={subjectEn}
              setSubjectEn={setSubjectEn}
              subjectFr={subjectFr}
              setSubjectFr={setSubjectFr}
              isInvalidEmailError={isInvalidEmailError}
              setIsInvalidEmailError={setIsInvalidEmailError}
            />
          )}

          <Button disabled={!isValid} theme="secondary" onClick={saveDeliveryOption}>
            {t("settingsResponseDelivery.saveButton")}
          </Button>

          <ResponseDeliveryHelpButton />
        </div>
      )}
      <div className="sticky top-0">
        <ToastContainer />
      </div>
    </>
  );
};
