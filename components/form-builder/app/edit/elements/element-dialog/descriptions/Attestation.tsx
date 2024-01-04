import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Checkbox, Label } from "@components/forms";

export const Attestation = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.checkbox.title")}</h3>
      <p>{t("addElementDialog.checkbox.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label className="gc-label">
          {t("addElementDialog.attest")}{" "}
          <span className="text-red-default">({t("addElementDialog.allRequired")})</span>
        </Label>

        <div className="overflow-hidden">
          <Checkbox id="one" label={t("addElementDialog.condition1")} name={"name"} />
          <Checkbox id="two" label={t("addElementDialog.condition2")} name={"name"} />
          <Checkbox id="three" label={t("addElementDialog.condition3")} name={"name"} />
        </div>
      </ExampleWrapper>
    </div>
  );
};
