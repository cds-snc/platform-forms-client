import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";

export const StrictValue = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  // ⚠️ Early return if not combobox
  if (item.type !== FormElementTypes.combobox) {
    return null;
  }

  const checked = item.properties.strictValue;

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("strictValue.title")}</h3>
      </div>
      <div>
        <div className="gc-input-checkbox">
          <input
            data-testid="strictValue"
            className="gc-input-checkbox__input"
            id={`strict-${item.id}-id-modal`}
            type="checkbox"
            defaultChecked={checked}
            value={`strict-${item.id}-value-modal-` + checked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  strictValue: e.target.checked,
                },
              });
            }}
          />
          <label
            data-testid="required"
            className="gc-checkbox-label"
            htmlFor={`strict-${item.id}-id-modal`}
          >
            <span className="checkbox-label-text">{t("strictValue.label")}</span>
          </label>
        </div>
      </div>
    </section>
  );
};
