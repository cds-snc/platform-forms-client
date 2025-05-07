import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared/Input";
import { WarningIcon } from "@serverComponents/icons";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const QuestionIdOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [error, setError] = React.useState<boolean>(false);

  const { form } = useTemplateStore((s) => ({
    form: s.form,
  }));

  useEffect(() => {
    const questionIds = form.elements
      .flatMap((element: FormElement) => [element, ...(element.properties.subElements || [])])
      .filter((element: FormElement) => element.id !== item.id)
      .map((element: FormElement) => element.properties?.questionId)
      .filter(Boolean);

    if (questionIds.includes(item.properties.questionId)) {
      setError(true);
    } else {
      setError(false);
    }
  }, [item.properties.questionId, form.elements, item.id]);

  if (item.type === FormElementTypes.richText) {
    return null;
  }

  return (
    <section className="mb-4 mt-6">
      <Label htmlFor={`title--modal--${item.id}`}>{t("moreDialog.questionId.title")}</Label>
      <p>{t("moreDialog.questionId.description")}</p>
      <Input
        id={`title--modal--${item.id}`}
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
