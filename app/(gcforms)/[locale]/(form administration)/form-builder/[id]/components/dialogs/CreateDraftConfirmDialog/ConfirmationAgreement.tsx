"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";

export const ConfirmationAgreement = ({
  handleAgreement,
}: {
  handleAgreement: (value: string) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [agreeValue, setAgreeValue] = useState("");

  return (
    <div className="mb-4">
      <p className="mb-6 font-bold">{t("prePublishFormDialog.republish.confirm.title")}</p>

      <p className="mb-4">{t("prePublishFormDialog.republish.confirm.text1")}</p>
      <p className="mb-8">{t("prePublishFormDialog.republish.confirm.text2")}</p>

      <p className="mb-2 font-bold">{t("prePublishFormDialog.republish.confirm.list")}</p>

      <ul className="mb-8">
        <li>{t("prePublishFormDialog.republish.confirm.listitem1")}</li>
        <li>{t("prePublishFormDialog.republish.confirm.listitem2")}</li>
        <li>{t("prePublishFormDialog.republish.confirm.listitem3")}</li>
      </ul>

      <label className="mb-2 block" id="enterAgreeInput">
        {t("prePublishFormDialog.republish.confirm.agree.label")}{" "}
        <strong className="mr-2 inline-block">
          {t("prePublishFormDialog.republish.confirm.agree.placeholder")}
        </strong>
        <span className="text-gcds-red-500">
          {t("prePublishFormDialog.republish.confirm.agree.required")}
        </span>
      </label>
      <div>
        <input
          type="text"
          id="confirmation-agree"
          className="gc-input-text mb-1 w-4/5"
          value={agreeValue}
          placeholder={t("prePublishFormDialog.republish.confirm.agree.placeholder")}
          onChange={(e) => {
            setAgreeValue(e.target.value);
            handleAgreement((e.target.value || "").toUpperCase().trim());
          }}
          aria-labelledby="enterAgreeInput"
        />
      </div>
    </div>
  );
};

export default ConfirmationAgreement;
