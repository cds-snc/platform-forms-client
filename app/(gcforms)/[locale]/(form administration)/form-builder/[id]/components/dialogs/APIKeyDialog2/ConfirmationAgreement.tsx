import React, { useState } from "react";
import { Trans } from "react-i18next";
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
      <label className="mb-2 block font-bold">
        {t("settings.api.dialog.confirm.label")}{" "}
        <span className="text-gcds-red-500">{t("settings.api.dialog.confirm.required")}</span>
      </label>
      <p className="mb-2">
        <Trans
          ns="form-builder"
          i18nKey="settings.api.dialog.confirm.description"
          defaults="<strong></strong> <a></a>"
          components={{ strong: <strong />, a: <a /> }}
        />
      </p>
      <div>
        <input
          type="text"
          className="gc-input-text mb-1 w-4/5"
          value={agreeValue}
          onChange={(e) => {
            setAgreeValue(e.target.value);
            handleAgreement(e.target.value);
          }}
        />
      </div>
    </div>
  );
};
