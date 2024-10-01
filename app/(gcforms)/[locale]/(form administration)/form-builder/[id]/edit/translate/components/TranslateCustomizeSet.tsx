import { Language } from "@lib/types/form-builder-types";
import { FieldsetLegend } from ".";
import { LanguageLabel } from "./LanguageLabel";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";

export const TranslateCustomizeSet = ({
  element,
  primaryLanguage,
  secondaryLanguage,
}: {
  element: FormElement;
  primaryLanguage: Language;
  secondaryLanguage: Language;
}) => {
  const { t } = useTranslation("form-builder");

  const { updateField, localizeField, propertyPath } = useTemplateStore((s) => ({
    updateField: s.updateField,
    localizeField: s.localizeField,
    propertyPath: s.propertyPath,
  }));

  const dynamicRowProps = element.properties.dynamicRow;

  if (!dynamicRowProps) {
    return null;
  }

  // row title
  const rowTitle = "rowTitle";

  const rowTitlePropEn = localizeField(rowTitle, primaryLanguage);
  const rowTitleEnValue = dynamicRowProps[rowTitlePropEn];
  const rowTitlePropFr = localizeField(rowTitle, secondaryLanguage);
  const rowTitleFrValue = dynamicRowProps[rowTitlePropFr];

  // Add button
  const addButtonText = "addButtonText";

  const addButtonPropEn = localizeField(addButtonText, primaryLanguage);
  const addButtonEnValue = dynamicRowProps[addButtonPropEn];
  const addButtonPropFr = localizeField(addButtonText, secondaryLanguage);
  const addButtonFrValue = dynamicRowProps[addButtonPropFr];

  // Remove button
  const removeButtonText = "removeButtonText";

  const removeButtonPropEn = localizeField(removeButtonText, primaryLanguage);
  const removeButtonEnValue = dynamicRowProps[removeButtonPropEn];
  const removeButtonPropFr = localizeField(removeButtonText, secondaryLanguage);
  const removeButtonFrValue = dynamicRowProps[removeButtonPropFr];

  return (
    <>
      {/* Start row title inputs */}
      <fieldset>
        <FieldsetLegend>
          {t("dynamicRow.translate.repeatingSet")} {":"} {t("dynamicRow.translate.rowTitleText")}
        </FieldsetLegend>
        <div className="mb-10 flex gap-px divide-x-2 border border-gray-300" key={primaryLanguage}>
          <div className="relative w-1/2 flex-1">
            <label htmlFor={`row-title-text-english-${element.id}`} className="sr-only">
              <>{primaryLanguage}</>
            </label>
            <LanguageLabel id={`row-title-text-english-desc-${element.id}`} lang={primaryLanguage}>
              <>{primaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="size-full p-4 focus:outline-blue-focus"
              id={`row-title-text-french-${element.id}`}
              aria-describedby={`row-title-text-english-desc-${element.id}`}
              value={rowTitleEnValue}
              onChange={(e) => {
                updateField(
                  propertyPath(element.id, `dynamicRow.${rowTitle}`, primaryLanguage),
                  e.target.value
                );
              }}
            />
          </div>
          <div className="relative w-1/2 flex-1">
            <label htmlFor={`row-title-text-french-${element.id}`} className="sr-only">
              <>{secondaryLanguage}</>
            </label>
            <LanguageLabel id={`row-title-text-french-desc-${element.id}`} lang={secondaryLanguage}>
              <>{secondaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="size-full p-4 focus:outline-blue-focus"
              id={`row-title-text-french-${element.id}`}
              aria-describedby={`row-title-text-french-desc-${element.id}`}
              value={rowTitleFrValue}
              onChange={(e) => {
                updateField(
                  propertyPath(element.id, `dynamicRow.${rowTitle}`, secondaryLanguage),
                  e.target.value
                );
              }}
            />
          </div>
        </div>
      </fieldset>
      {/* End row title inputs */}

      {/* Start add button inputs */}
      <fieldset>
        <FieldsetLegend>
          {t("dynamicRow.translate.repeatingSet")} {":"} {t("dynamicRow.translate.addButtonText")}
        </FieldsetLegend>
        {/* English */}
        <div className="mb-10 flex gap-px divide-x-2 border border-gray-300" key={primaryLanguage}>
          <label htmlFor={`add-button-text-english-${element.id}`} className="sr-only">
            <>{primaryLanguage}</>
          </label>
          <div className="relative w-1/2 flex-1">
            <LanguageLabel id={`add-button-text-english-desc-${element.id}`} lang={primaryLanguage}>
              <>{primaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="size-full p-4 focus:outline-blue-focus"
              id={`add-button-text-english-${element.id}`}
              aria-describedby={`add-button-text-english-desc-${element.id}`}
              value={addButtonEnValue}
              onChange={(e) => {
                updateField(
                  propertyPath(element.id, `dynamicRow.${addButtonText}`, primaryLanguage),
                  e.target.value
                );
              }}
            />
          </div>
          {/* French */}
          <div className="relative w-1/2 flex-1">
            <label htmlFor={`add-button-text-french-${element.id}`} className="sr-only">
              <>{secondaryLanguage}</>
            </label>
            <LanguageLabel
              id={`add-button-text-french-desc-${element.id}`}
              lang={secondaryLanguage}
            >
              <>{secondaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="size-full p-4 focus:outline-blue-focus"
              id={`add-button-text-french-${element.id}`}
              aria-describedby={`add-button-text-french-desc-${element.id}`}
              value={addButtonFrValue}
              onChange={(e) => {
                updateField(
                  propertyPath(element.id, `dynamicRow.${addButtonText}`, secondaryLanguage),
                  e.target.value
                );
              }}
            />
          </div>
        </div>
      </fieldset>
      {/* End add button inputs */}

      {/* Start remove button inputs */}
      <fieldset>
        <FieldsetLegend>
          {t("dynamicRow.translate.repeatingSet")} {":"}{" "}
          {t("dynamicRow.translate.removeButtonText")}
        </FieldsetLegend>
        <div className="mb-10 flex gap-px divide-x-2 border border-gray-300" key={primaryLanguage}>
          <div className="relative w-1/2 flex-1">
            <label htmlFor={`remove-button-text-english-${element.id}`} className="sr-only">
              <>{primaryLanguage}</>
            </label>
            <LanguageLabel
              id={`remove-button-text-english-desc-${element.id}`}
              lang={primaryLanguage}
            >
              <>{primaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="size-full p-4 focus:outline-blue-focus"
              id={`remove-button-text-french-${element.id}`}
              aria-describedby={`remove-button-text-english-desc-${element.id}`}
              value={removeButtonEnValue}
              onChange={(e) => {
                updateField(
                  propertyPath(element.id, `dynamicRow.${removeButtonText}`, primaryLanguage),
                  e.target.value
                );
              }}
            />
          </div>
          <div className="relative w-1/2 flex-1">
            <label htmlFor={`remove-button-text-french-${element.id}`} className="sr-only">
              <>{secondaryLanguage}</>
            </label>
            <LanguageLabel
              id={`remove-button-text-french-desc-${element.id}`}
              lang={secondaryLanguage}
            >
              <>{secondaryLanguage}</>
            </LanguageLabel>
            <textarea
              className="size-full p-4 focus:outline-blue-focus"
              id={`remove-button-text-french-${element.id}`}
              aria-describedby={`remove-button-text-french-desc-${element.id}`}
              value={removeButtonFrValue}
              onChange={(e) => {
                updateField(
                  propertyPath(element.id, `dynamicRow.${removeButtonText}`, secondaryLanguage),
                  e.target.value
                );
              }}
            />
          </div>
        </div>
      </fieldset>
      {/* End remove button inputs */}
    </>
  );
};
