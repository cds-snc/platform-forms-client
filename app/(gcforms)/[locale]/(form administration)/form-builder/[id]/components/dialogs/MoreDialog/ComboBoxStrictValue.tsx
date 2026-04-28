import { useTranslation } from "@i18n/client";
import { FormElement } from "@lib/types";

export const ComboboxStrictValue = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const checked = item.properties.strictValue;

  if (item.type !== "combobox") {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("strictValue.title")}</h3>
      </div>
      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          type="checkbox"
          data-testid="strictValue"
          id={`strict-value-${item.id}-id-modal`}
          value={`strict-value-${item.id}-value-modal-` + checked}
          key={`strict-value-${item.id}-modal-` + checked}
          defaultChecked={checked}
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
          data-testid="strictValue-label"
          className="gc-checkbox-label"
          htmlFor={`strict-value-${item.id}-id-modal`}
        >
          <span className="checkbox-label-text">{t("strictValue.label")}</span>
        </label>
      </div>
    </section>
  );
};
