import { Input } from "@formBuilder/components/shared/Input";
import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Hint } from "./Hint";

export const DynamicRowOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type !== FormElementTypes.dynamicRow) {
    return null;
  }

  return (
    <section className="mb-4">
      <Label htmlFor={`maxNumberOfRows--modal--${item.id}`}>{t("maxNumberOfRows.label")}</Label>
      <Hint>{t("maxNumberOfRows.description")}</Hint>
      <Input
        id={`maxNumberOfRows--modal--${item.id}`}
        type="number"
        min="1"
        className="w-1/4"
        value={item.properties.maxNumberOfRows || ""}
        onKeyDown={(e) => {
          if (["-", "+", ".", "e"].includes(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          // if value is "", unset the field
          if (e.target.value === "") {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ maxNumberOfRows: undefined },
              },
            });
            return;
          }

          const value = parseInt(e.target.value);
          if (!isNaN(value) && value >= 1) {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ maxNumberOfRows: value },
              },
            });
          }
        }}
      />
    </section>
  );
};
