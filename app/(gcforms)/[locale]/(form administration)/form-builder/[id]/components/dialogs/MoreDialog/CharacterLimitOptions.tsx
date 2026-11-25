import { useTranslation } from "@i18n/client";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";
import { Input } from "@formBuilder/components/shared/Input";
import { FormElement, FormElementTypes } from "@lib/types";
import { Label } from "./Label";
import { Hint } from "./Hint";

export const CharacterLimitOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const allowedTypes: FormElementTypes[] = [FormElementTypes.textField, FormElementTypes.textArea];

  if (
    !allowedTypes.includes(item.type) ||
    (item.properties.validation?.type && item.properties.validation?.type !== "text")
  ) {
    return null;
  }

  return (
    <section className="mb-4">
      <div className="mb-2">
        <Label htmlFor={`characterLength--modal--${item.id}`}>{t("maximumCharacterLength")}</Label>
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
              // setting maxLength clears maxWords to enforce mutually exclusive constraint
              const validation = Object.assign({}, item.properties.validation, {
                maxLength: value,
                maxWords: undefined,
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
        <InfoDetails summary={t("characterLimitWhenToUse.title")}>
          <div className="mt-4 mb-8 border-l-3 border-gray-500 pl-8">
            <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text1")}</p>
            <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text2")}</p>
            <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text3")}</p>
            {item.type === FormElementTypes.textArea && (
              <p className="text-sm">{t("characterLimitWhenToUse.text4")}</p>
            )}
          </div>
        </InfoDetails>

        {item.type === FormElementTypes.textArea && (
          <>
            <Label htmlFor={`wordCount--modal--${item.id}`}>{t("maximumWordCount")}</Label>
            <Hint>{t("maximumWordCountDescription")}</Hint>
            <Input
              id={`wordCount--modal--${item.id}`}
              type="number"
              min="1"
              className="w-1/4"
              value={item.properties.validation?.maxWords || ""}
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
                          maxWords: undefined,
                        },
                      },
                    },
                  });
                  return;
                }

                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1) {
                  // clone the existing properties so that we don't overwrite other keys in "validation"
                  // setting maxWords clears maxLength to enforce mutually exclusive constraint
                  const validation = Object.assign({}, item.properties.validation, {
                    maxWords: value,
                    maxLength: undefined,
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
            <InfoDetails summary={t("wordLimitWhenToUse.title")}>
              <div className="mt-4 mb-8 border-l-3 border-gray-500 pl-8">
                <p className="mb-4 text-sm">{t("wordLimitWhenToUse.text1")}</p>
                <p className="mb-4 text-sm">{t("wordLimitWhenToUse.text2")}</p>
                <p className="mb-4 text-sm">{t("wordLimitWhenToUse.text3")}</p>
                <p className="text-sm">{t("wordLimitWhenToUse.text4")}</p>
              </div>
            </InfoDetails>
          </>
        )}
      </div>
    </section>
  );
};
