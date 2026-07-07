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
      <label className="mb-2 block font-bold" id="enterAgreeInput">
        {t("confirm.createDraft.label")}{" "}
        <span className="text-gcds-red-500">{t("confirm.createDraft.required")}</span>
      </label>
      <div>
        <input
          type="text"
          id="confirmation-agree"
          className="gc-input-text mb-1 w-4/5"
          value={agreeValue}
          placeholder={t("confirm.createDraft.placeholder")}
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
