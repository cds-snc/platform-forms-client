import { useTranslation } from "@i18n/client";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Hint } from "./Hint";
import { Input } from "@formBuilder/components/shared/Input";
import { v4 as uuid } from "uuid";

export const QuestionTagOptions = ({
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
    <section className="mb-4 mt-8">
      <Label htmlFor="">{t("Question tag")}</Label>
      <Hint>
        {t("Adding a question tag allows the question to contain a permanent identifier.")}
      </Hint>
      <Input
        id={`title--modal--${item.id}`}
        name={`item${item.id}`}
        value={item.properties.tag || uuid()}
        className="w-11/12"
        onChange={(e) => {
          setItem({
            ...item,
            properties: {
              ...item.properties,
              tag: e.target.value,
            },
          });
        }}
      />
      <div>
        <InfoDetails summary={t("How tags can help")}>
          <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
            <p className="mb-4 text-sm">{t("text description")}</p>
          </div>
        </InfoDetails>
      </div>
    </section>
  );
};
