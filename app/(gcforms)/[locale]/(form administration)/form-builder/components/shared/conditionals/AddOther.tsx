"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElementTypes } from "@lib/types";
import { getTranslatedProperties } from "../../../actions";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { allowGrouping } from "@formBuilder/components/shared/right-panel/treeview/util/allowGrouping";

export const AddOther = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");

  const { add } = useTemplateStore((s) => ({
    add: s.add,
  }));

  const groupId = useGroupStore((state) => state.id);

  const addOther = useCallback(async () => {
    if (!item.properties.choices) return;

    // get last choice
    const lastChoice = item.properties.choices.length - 1;

    const otherLabel: { en: string; fr: string } = await getTranslatedProperties(
      "addConditionalRules.other"
    );

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

    const allowGroups = await allowGrouping();
    if (allowGroups) {
      add(item.index, FormElementTypes.textField, data, groupId);
    } else {
      add(item.index, FormElementTypes.textField, data);
    }
  }, [add, item]);

  return (
    <Button className="!m-0 !mt-4" theme="link" onClick={addOther}>
      {t("addConditionalRules.addOther")}
    </Button>
  );
};
