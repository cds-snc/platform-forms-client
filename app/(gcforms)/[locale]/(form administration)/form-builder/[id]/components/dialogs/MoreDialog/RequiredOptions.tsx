import { useTranslation } from "@i18n/client";
import { FormElement } from "@lib/types";

export const RequiredOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const checked = item.properties.validation?.required;
  const allRequired = item.properties.validation?.all;

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("addRules")}</h3>
      </div>
      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          data-testid="required"
          id={`required-${item.id}-id-modal`}
          type="checkbox"
          value={`required-${item.id}-value-modal-` + checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // clone the existing properties so that we don't overwrite other keys in "validation"
            const validation = Object.assign({}, item.properties.validation, {
              required: e.target.checked,
            });
            setItem({
              ...item,
              properties: {
                ...item.properties,
                ...{ validation },
              },
            });
          }}
        />
        <label className="gc-checkbox-label" htmlFor={`required-${item.id}-id-modal`}>
          <span className="checkbox-label-text">
            {allRequired ? t("allRequired") : t("required")}
          </span>
        </label>
      </div>
    </section>
  );
};
