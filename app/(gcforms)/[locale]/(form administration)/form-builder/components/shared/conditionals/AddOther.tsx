"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElementTypes } from "@lib/types";
import { getTranslatedProperties } from "../../../actions";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { BoltIcon } from "@serverComponents/icons";
import { type ChoiceRule } from "@gcforms/types";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const AddOther = ({
  item,
  onComplete,
}: {
  item: FormElementWithIndex;
  onComplete: (newRule: ChoiceRule) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { add, addLabeledChoice } = useTemplateStore((s) => ({
    add: s.add,
    addLabeledChoice: s.addLabeledChoice,
  }));

  const groupId = useGroupStore((state) => state.id);

  const addOther = useCallback(async () => {
    if (!item.properties.choices) return;

    const otherLabel: { en: string; fr: string } = await getTranslatedProperties(
      "addConditionalRules.other"
    );

    const lastChoice = (await addLabeledChoice(item.index, otherLabel)) - 1;

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

    let itemId = 0;
    itemId = await add(item.index, FormElementTypes.textField, data, groupId);

    const newRule = { elementId: `${itemId}`, choiceId: `${item.id}.${lastChoice}` };
    onComplete(newRule);
  }, [add, addLabeledChoice, item, groupId, onComplete]);

  return (
    <>
      <Button className="group/button !m-0 !mt-4 inline" theme={"secondary"} onClick={addOther}>
        <>
          <BoltIcon className="mr-2 inline pb-[2px] group-hover/button:fill-white group-focus/button:fill-white" />
          {t("addConditionalRules.addOther")}
        </>
      </Button>
    </>
  );
};
