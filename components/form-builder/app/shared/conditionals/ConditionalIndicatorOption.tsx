import React from "react";
import { useTranslation } from "next-i18next";

import { ConditionalIcon } from "@components/form-builder/icons/ConditionalIcon";
import { getElementsUsingChoiceId } from "@lib/formContext";
import { FormElement } from "@lib/types";
import { useRefsContext } from "@formbuilder/app/edit/RefsContext";
import { Button } from "@components/globals";

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

  const { refs } = useRefsContext();

  if (!questions.length) {
    return null;
  }

  return (
    <div className="ml-2 mt-2">
      <div className="flex">
        <ConditionalIcon className="mr-2  inline-block" />
        <div className="inline-block">
          {questions.map(({ elementId }, index) => (
            <label key={`${elementId}-${index}`}>
              {t("addConditionalRules.show")}{" "}
              <Button
                theme="link"
                onClick={() => {
                  const id = Number(elementId);
                  if (!refs || !refs.current) {
                    return;
                  }
                  refs.current[id].focus();
                }}
              >
                {elements.find((element) => element.id === Number(elementId))?.properties?.titleEn}
              </Button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
