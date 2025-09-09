"use client";
import { useTranslation } from "@i18n/client";
import { FormElementTypes, FormElement } from "@lib/types";

export const NumberFieldOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type !== FormElementTypes.textField) {
    return null;
  }

  const checked = item.properties.allowNegativeNumbers;

  return (
    <section className="mb-4">
      <div className="gc-input-checkbox">
        <input
          type="checkbox"
          className="gc-input-checkbox__input"
          id={`numberField-${item.id}-id-allowNegative`}
          value={`numberField-${item.id}-value-allowNegative-` + checked}
          defaultChecked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // clone the existing properties so that we don't overwrite other keys in "allowNegativeNumbers"
            const allowNegativeNumbers = e.target.checked;
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ allowNegativeNumbers },
              },
            });
          }}
        />
        <label
          data-testid="allowNegative"
          className="gc-checkbox-label"
          htmlFor={`numberField-${item.id}-id-allowNegative`}
        >
          <span className="checkbox-label-text">{t("addElementDialog.number.allowNegative")}</span>
        </label>
      </div>
    </section>
  );
};
