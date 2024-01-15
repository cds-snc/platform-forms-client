import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { FormElementTypes, ElementProperties } from "@lib/types";

import { FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { Checkbox, Input, TextArea, InfoDetails } from "../shared";
import { useTemplateStore } from "../../store";
import { AutocompleteDropdown } from "./AutocompleteDropdown";

const ModalLabel = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className="mb-2 block font-[700]">
    {children}
  </label>
);

const Hint = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className="mb-5 leading-snug">
    {children}
  </p>
);

export const ModalForm = ({
  item,
  properties,
  updateModalProperties,
  unsetModalField,
}: {
  item: FormElementWithIndex;
  properties: ElementProperties;
  updateModalProperties: (id: number, properties: ElementProperties) => void;
  unsetModalField: (path: string) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const autocompleteSelectedValue = properties.autoComplete || "";

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <div className="mb-2">
        <ModalLabel htmlFor={`titleEn--modal--${item.index}`}>{t("question")}</ModalLabel>
        <Input
          id={`title--modal--${item.index}`}
          name={`item${item.index}`}
          placeholder={t("question")}
          value={
            properties[localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)]
          }
          className="w-11/12"
          onChange={(e) =>
            updateModalProperties(item.id, {
              ...properties,
              ...{
                [localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)]:
                  e.target.value,
              },
            })
          }
        />
      </div>
      <div className="mb-2">
        <ModalLabel>{t("description")}</ModalLabel>
        <Hint>{t("descriptionDescription")}</Hint>
        <TextArea
          id={`description--modal--${item.index}`}
          placeholder={t("inputDescription")}
          testId="description-input"
          className="w-11/12"
          onChange={(e) => {
            const description = e.target.value.replace(/[\r\n]/gm, "");
            updateModalProperties(item.id, {
              ...properties,
              ...{
                [localizeField(
                  LocalizedElementProperties.DESCRIPTION,
                  translationLanguagePriority
                )]: description,
              },
            });
          }}
          value={
            properties[
              localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
            ]
          }
        />
      </div>
      <div className="mb-2">
        <h3>{t("addRules")}</h3>
      </div>
      <div className="mb-2">
        <Checkbox
          id={`required-${item.index}-id-modal`}
          value={`required-${item.index}-value-modal`}
          checked={properties.validation?.required}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // clone the existing properties so that we don't overwrite other keys in "validation"
            const validation = Object.assign({}, properties.validation, {
              required: e.target.checked,
            });
            updateModalProperties(item.id, {
              ...properties,
              ...{ validation },
            });
          }}
          label={t("required")}
        ></Checkbox>
      </div>
      {item.type === FormElementTypes.dynamicRow && (
        <div className="mb-2">
          <ModalLabel htmlFor={`maxNumberOfRows--modal--${item.index}`}>
            {t("maxNumberOfRows.label")}
          </ModalLabel>
          <Hint>{t("maxNumberOfRows.description")}</Hint>
          <Input
            id={`maxNumberOfRows--modal--${item.index}`}
            type="number"
            min="1"
            className="w-1/4"
            value={properties.maxNumberOfRows || ""}
            onKeyDown={(e) => {
              if (["-", "+", ".", "e"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // if value is "", unset the field
              if (e.target.value === "") {
                unsetModalField(`modals[${item.id}].properties.maxNumberOfRows`);
                return;
              }

              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                updateModalProperties(item.id, {
                  ...properties,
                  maxNumberOfRows: value,
                });
              }
            }}
          />
        </div>
      )}

      {item.type === FormElementTypes.textField && (
        <div className="mb-2 mt-8">
          <ModalLabel htmlFor="">{t("selectAutocomplete")}</ModalLabel>
          <Hint>{t("selectAutocompleteHint")}</Hint>
          <div>
            <AutocompleteDropdown
              handleChange={(e) => {
                const autoComplete = e.target.value;
                updateModalProperties(item.id, {
                  ...properties,
                  ...{ autoComplete },
                });
              }}
              selectedValue={autocompleteSelectedValue as string}
            />{" "}
            <InfoDetails summary={t("autocompleteWhenNotToUse.title")}>
              <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
                <p className="mb-4 text-sm">{t("autocompleteWhenNotToUse.text1")}</p>
                <p className="text-sm">{t("autocompleteWhenNotToUse.text2")}</p>
              </div>
            </InfoDetails>
          </div>
        </div>
      )}
      {item.type === FormElementTypes.textField ||
        (FormElementTypes.textArea &&
          (!item.properties.validation?.type || item.properties.validation?.type === "text") && (
            <>
              <div className="mb-2">
                <ModalLabel htmlFor={`characterLength--modal--${item.index}`}>
                  {t("maximumCharacterLength")}
                </ModalLabel>
                <Hint>{t("characterLimitDescription")}</Hint>
                <Input
                  id={`characterLength--modal--${item.index}`}
                  type="number"
                  min="1"
                  className="w-1/4"
                  value={properties.validation?.maxLength || ""}
                  onKeyDown={(e) => {
                    if (["-", "+", ".", "e"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // if value is "", unset the field
                    if (e.target.value === "") {
                      unsetModalField(`modals[${item.id}].validation.maxLength`);
                      return;
                    }

                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1) {
                      // clone the existing properties so that we don't overwrite other keys in "validation"
                      const validation = Object.assign({}, properties.validation, {
                        maxLength: value,
                      });
                      updateModalProperties(item.id, {
                        ...properties,
                        ...{ validation },
                      });
                    }
                  }}
                />
              </div>
              <InfoDetails className="mb-4" summary={t("characterLimitWhenToUse.title")}>
                <div className="mb-8 mt-4 border-l-3 border-gray-500 pl-8">
                  <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text1")}</p>
                  <p className="mb-4 text-sm">{t("characterLimitWhenToUse.text2")}</p>
                  <p className="text-sm">{t("characterLimitWhenToUse.text3")}</p>
                </div>
              </InfoDetails>
            </>
          ))}
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};
