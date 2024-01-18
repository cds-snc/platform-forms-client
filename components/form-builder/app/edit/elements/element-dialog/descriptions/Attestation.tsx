import React from "react";
import { useTranslation } from "next-i18next";
import { ExampleWrapper } from "./ExampleWrapper";
import { Checkbox, Label } from "@components/forms";

export const Attestation = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-0">{t("addElementDialog.attestation.title")}</h3>
      <p>{t("addElementDialog.attestation.description")}</p>

      <ExampleWrapper className="mt-4">
        <Label className="gc-label">
          {t("addElementDialog.attest")}{" "}
          <span className="text-red-default">({t("addElementDialog.allRequired")})</span>
        </Label>

        <div className="overflow-hidden">
          <Checkbox id="one" label={t("addElementDialog.condition1")} name={"nameOne"} />
          <Checkbox id="two" label={t("addElementDialog.condition2")} name={"nameTwo"} />
          <Checkbox id="three" label={t("addElementDialog.condition3")} name={"nameThree"} />
        </div>
      </ExampleWrapper>
    </div>
  );
};
