import { useTranslation } from "@i18n/client";
import { InfoDetails, Input } from "@formBuilder/components/shared";
import { FormElement, FormElementTypes } from "@lib/types";
import { ModalLabel } from "./ModalLabel";
import { Hint } from "./Hint";

export const CharacterLimitOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  // @TODO: check?
  if (
    ![FormElementTypes.textField, FormElementTypes.textArea].includes(item.type) ||
    (item.properties.validation?.type && item.properties.validation?.type !== "text")
  ) {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="mb-2">
        <ModalLabel htmlFor={`characterLength--modal--${item.id}`}>
          {t("maximumCharacterLength")}
        </ModalLabel>
        <Hint>{t("characterLimitDescription")}</Hint>
        <Input
          id={`characterLength--modal--${item.id}`}
          type="number"
          min="1"
          className="w-1/4"
          value={item.properties.validation?.maxLength || ""}
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
                  ...{
                    validation: {
                      ...(item.properties.validation ?? { required: false }),
                      maxLength: undefined,
                    },
                  },
                },
              });
              return;
            }

            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 1) {
              // clone the existing properties so that we don't overwrite other keys in "validation"
              const validation = Object.assign({}, item.properties.validation, {
                maxLength: value,
              });
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  ...{ validation },
                },
              });
            }
          }}
        />
      </div>
      <InfoDetails summary={t("characterLimitWhenToUse.title")}>
        <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
          <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text1")}</p>
          <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text2")}</p>
          <p className="text-sm">{t("characterLimitWhenToUse.text3")}</p>
        </div>
      </InfoDetails>
    </section>
  );
};
