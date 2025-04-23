import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared/Input";
import { v4 as uuid } from "uuid";
import { WarningIcon } from "@serverComponents/icons";

export const QuestionIDOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type === FormElementTypes.richText) {
    return null;
  }

  return (
    <section className="mb-4 mt-6">
      <Label htmlFor={`title--modal--${item.id}`}>{t("Question ID")}</Label>
      <p>
        Unique value to consistently refer to a form element so that they can match across
        republished form versions, data structures and systems.
      </p>
      <div className="my-4 font-bold text-red-600">
        <WarningIcon className="inline-block fill-red-600" /> Choose a unique value that differs
        from other questions.
      </div>
      <Input
        id={`title--modal--${item.id}`}
        name={`item${item.id}`}
        value={item.properties.questionId || uuid()}
        className="w-11/12"
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
    </section>
  );
};
