"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store";
import { FormElementTypes } from "@lib/types";

export const AddOther = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");

  const { add } = useTemplateStore((s) => ({
    add: s.add,
  }));

  const addOther = useCallback(() => {
    if (!item.properties.choices) return;

    // get last choice
    const lastChoice = item.properties.choices.length - 1;

    const otherLabel = {
      en: t("addConditionalRules.other"),
      fr: t("addConditionalRules.other", { lng: "fr" }),
    };

    const data = {
      id: 1,
      type: FormElementTypes.textField,
      properties: {
        subElements: [],
        choices: [{ en: "", fr: "" }],
        titleEn: otherLabel.en,
        titleFr: otherLabel.fr,
        conditionalRules: [{ choiceId: `${item.id}.${lastChoice}` }],
        descriptionEn: "",
        descriptionFr: "",
        placeholderEn: "",
        placeholderFr: "",
      },
    };

    add(item.index, FormElementTypes.textField, data);
  }, [add, item, t]);

  return (
    <Button className="!m-0 !mt-4" theme="link" onClick={addOther}>
      {t("addConditionalRules.addOther")}
    </Button>
  );
};
