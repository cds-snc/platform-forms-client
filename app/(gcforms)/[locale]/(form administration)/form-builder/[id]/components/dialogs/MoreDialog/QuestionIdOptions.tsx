import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared/Input";
import { WarningIcon } from "@serverComponents/icons";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { isUniqueQuestionId } from "@lib/utils/validateUniqueQuestionIds";

export const QuestionIdOptions = ({
  item,
  setItem,
  setIsValid,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
  setIsValid: (isValid: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [error, setError] = React.useState<boolean>(false);

  const { form } = useTemplateStore((s) => ({
    form: s.form,
  }));

  useEffect(() => {
    const questionId = item.properties.questionId;
    if (!questionId || questionId === "") {
      setError(false);
      setIsValid(true);
      return;
    }

    if (isUniqueQuestionId(form.elements, questionId, item)) {
      setError(false);
      setIsValid(true);
    } else {
      setError(true);
      setIsValid(false);
    }
  }, [item.properties.questionId, form.elements, item, setIsValid]);

  if (item.type === FormElementTypes.richText) {
    return null;
  }

  return (
    <section className="mb-4 mt-6">
      <Label htmlFor={`questionId-${item.id}`}>{t("moreDialog.questionId.title")}</Label>
      <p>{t("moreDialog.questionId.description")}</p>
      <Input
        id={`questionId-${item.id}`}
        name={`item${item.id}`}
        value={item.properties.questionId || ""}
        className={`w-11/12` + (error ? " !border-red-700 outline-2 !outline-red-700" : "")}
        onChange={(e) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              questionId: e.target.value,
            },
          });
        }}
      />
      {error && (
        <div className="my-4 font-bold text-red-700">
          <WarningIcon className="inline-block fill-red-700" />{" "}
          {t("moreDialog.questionId.uniqueWarning")}
        </div>
      )}
    </section>
  );
};
