"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElementTypes } from "@lib/types";
import { getTranslatedProperties } from "../../../actions";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { BoltIcon } from "@serverComponents/icons";
import { type ChoiceRule } from "@gcforms/types";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

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
  const isLimitReached = (item.properties.choices?.length ?? 0) >= MAX_CHOICE_AMOUNT;

  const addOther = useCallback(async () => {
    if (!item.properties.choices || isLimitReached) return;

    const otherLabel: { en: string; fr: string } = await getTranslatedProperties(
      "addConditionalRules.other"
    );

    const lastChoice = await addLabeledChoice(item.index, otherLabel);

    if (lastChoice === null) {
      return;
    }

    const data = {
      id: 1,
      type: FormElementTypes.textField,
      properties: {
        subElements: [],
        choices: [{ en: "", fr: "" }],
        titleEn: otherLabel.en,
        titleFr: otherLabel.fr,
        conditionalRules: [{ choiceId: `${item.id}.${lastChoice - 1}` }],
        descriptionEn: "",
        descriptionFr: "",
        placeholderEn: "",
        placeholderFr: "",
      },
    };

    let itemId = 0;
    itemId = await add(item.index, FormElementTypes.textField, data, groupId);

    const newRule = { elementId: `${itemId}`, choiceId: `${item.id}.${lastChoice - 1}` };
    onComplete(newRule);
  }, [add, addLabeledChoice, groupId, isLimitReached, item, onComplete]);

  return (
    <>
      <Button
        className="group/button !m-0 !mt-4 inline"
        theme={"secondary"}
        disabled={isLimitReached}
        onClick={addOther}
      >
        <>
          <BoltIcon className="mr-2 inline pb-[2px] group-hover/button:fill-white group-focus/button:fill-white" />
          {t("addConditionalRules.addOther")}
        </>
      </Button>
    </>
  );
};
