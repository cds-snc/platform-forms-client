import { useTranslation } from "@i18n/client";
import { FormElement, FormElementTypes } from "@lib/types";

export const StarRatingSparkleOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  if (item.type !== FormElementTypes.starRating) return null;

  const checked = item.properties.sparkleOnSelect ?? false;

  return (
    <section className="mb-4">
      <div className="mb-2">
        <h3>{t("moreDialog.starRatingSparkle.title")}</h3>
      </div>
      <div className="gc-input-checkbox">
        <input
          className="gc-input-checkbox__input"
          id={`sparkle-${item.id}-id-modal`}
          type="checkbox"
          checked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setItem({
              ...item,
              properties: {
                ...item.properties,
                sparkleOnSelect: e.target.checked,
              },
            });
          }}
        />
        <label className="gc-checkbox-label" htmlFor={`sparkle-${item.id}-id-modal`}>
          <span className="checkbox-label-text">
            {t("moreDialog.starRatingSparkle.checkboxLabel")}
          </span>
        </label>
      </div>
    </section>
  );
};
