import React from "react";
import { useTranslation } from "next-i18next";

import { ConditionalIcon } from "@components/form-builder/icons/ConditionalIcon";
import { getElementsUsingChoiceId } from "@lib/formContext";
import { FormElement } from "@lib/types";

export const ConditionalIndicatorOption = ({
  id,
  elements,
}: {
  id: string;
  elements: FormElement[];
}) => {
  const { t } = useTranslation("form-builder");
  const questions = getElementsUsingChoiceId({
    formElements: elements,
    choiceId: id,
  });

  if (!questions.length) {
    return null;
  }

  return (
    <div className="ml-2 mt-2">
      <div className="flex">
        <ConditionalIcon className="mr-2  inline-block" />
        <div className="inline-block">
          {questions.map(({ elementId }, index) => (
            <div key={`${elementId}-${index}`}>
              {t("addConditionalRules.show")}{" "}
              {elements.find((element) => element.id === Number(elementId))?.properties?.titleEn}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
