import { useState } from "react";
import { Input } from "@formBuilder/components/shared/Input";
import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Hint } from "./Hint";
import { MAX_DYNAMIC_ROW_AMOUNT } from "@root/constants";
import { WarningIcon } from "@serverComponents/icons";

export const DynamicRowOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [error, setError] = useState<boolean>(false);

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
        placeholder={MAX_DYNAMIC_ROW_AMOUNT.toString()}
        max={String(MAX_DYNAMIC_ROW_AMOUNT)}
        className="w-1/4"
        value={item.properties.maxNumberOfRows || ""}
        onKeyDown={(e) => {
          if (["-", "+", ".", "e"].includes(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setError(false);

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
            // Ensure the value does not exceed the maximum allowed rows
            if (value > MAX_DYNAMIC_ROW_AMOUNT) {
              setError(true);
              return;
            }

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

      {error && (
        <div className="my-4 font-bold text-red-700">
          <WarningIcon className="inline-block fill-red-700" />{" "}
          {t("moreDialog.dynamicRow.errorMaxRows", { maxRows: MAX_DYNAMIC_ROW_AMOUNT })}
        </div>
      )}
    </section>
  );
};
