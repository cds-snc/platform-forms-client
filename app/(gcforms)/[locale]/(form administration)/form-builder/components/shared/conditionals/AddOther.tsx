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
import { BoltIcon } from "@serverComponents/icons";

export const AddOther = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");

  const { add, addLabeledChoice } = useTemplateStore((s) => ({
    add: s.add,
    addLabeledChoice: s.addLabeledChoice,
  }));

  const groupId = useGroupStore((state) => state.id);

  const addOther = useCallback(async () => {
    if (!item.properties.choices) return;

    // get last choice
    let lastChoice = item.properties.choices.length - 1;

    const otherLabel: { en: string; fr: string } = await getTranslatedProperties(
      "addConditionalRules.other"
    );

    addLabeledChoice(item.index, otherLabel);
    lastChoice = lastChoice + 1;

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
  }, [add, item, groupId]);

  return (
    <>
      <Button className="!m-0 !mt-4 inline" theme={"secondary"} onClick={addOther}>
        <>
          <BoltIcon className="inline pb-[2px] mr-2" />
          {t("addConditionalRules.addOther")}
        </>
      </Button>
    </>
  );
};
