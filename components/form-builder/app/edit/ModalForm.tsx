import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { FormElementTypes, ElementProperties } from "@lib/types";

import { FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { Checkbox, Input, TextArea, InfoDetails } from "../shared";
import { useTemplateStore } from "../../store";
import { AutocompleteDropdown } from "./AutocompleteDropdown";

const ModalLabel = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label {...props} className="block mb-50 font-[700]">
    {children}
  </label>
);

const Hint = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props} className="font[16.5px] mb-5 leading-snug">
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
  updateModalProperties: (index: number, properties: ElementProperties) => void;
  unsetModalField: (path: string) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const localizeField = useTemplateStore((s) => s.localizeField);

  const autocompleteSelectedValue = properties.autoComplete || "";

  return (
    <form
      className="modal-form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
    >
      <div className="mb-2">
        <ModalLabel htmlFor={`titleEn--modal--${item.index}`}>{t("question")}</ModalLabel>
        <Input
          id={`title--modal--${item.index}`}
          name={`item${item.index}`}
          placeholder={t("question")}
          value={properties[localizeField(LocalizedElementProperties.TITLE)]}
          className="w-11/12"
          onChange={(e) =>
            updateModalProperties(item.index, {
              ...properties,
              ...{ [localizeField(LocalizedElementProperties.TITLE)]: e.target.value },
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
          className="w-11/12"
          onChange={(e) => {
            const description = e.target.value.replace(/[\r\n]/gm, "");
            updateModalProperties(item.index, {
              ...properties,
              ...{ [localizeField(LocalizedElementProperties.DESCRIPTION)]: description },
            });
          }}
          value={properties[localizeField(LocalizedElementProperties.DESCRIPTION)]}
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
            updateModalProperties(item.index, {
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
                unsetModalField(`modals[${item.index}].properties.maxNumberOfRows`);
                return;
              }

              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                updateModalProperties(item.index, {
                  ...properties,
                  maxNumberOfRows: value,
                });
              }
            }}
          />
        </div>
      )}

      {item.type === FormElementTypes.textField && (
        <div className="mt-8 mb-2">
          <ModalLabel htmlFor="">{t("selectAutocomplete")}</ModalLabel>
          <Hint>{t("selectAutocompleteHint")}</Hint>
          <div>
            <AutocompleteDropdown
              handleChange={(e) => {
                const autoComplete = e.target.value;
                updateModalProperties(item.index, {
                  ...properties,
                  ...{ autoComplete },
                });
              }}
              selectedValue={autocompleteSelectedValue as string}
            />{" "}
            <InfoDetails summary={t("autocompleteWhenNotToUse.title")}>
              <div className="mt-4 mb-8 border-l-3 border-gray-500 pl-8">
                <p className="text-md mb-4">{t("autocompleteWhenNotToUse.text1")}</p>
                <p className="text-md">{t("autocompleteWhenNotToUse.text2")}</p>
              </div>
            </InfoDetails>
          </div>
        </div>
      )}
      {item.type === FormElementTypes.textField &&
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
                    unsetModalField(`modals[${item.index}].validation.maxLength`);
                    return;
                  }

                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    // clone the existing properties so that we don't overwrite other keys in "validation"
                    const validation = Object.assign({}, properties.validation, {
                      maxLength: value,
                    });
                    updateModalProperties(item.index, {
                      ...properties,
                      ...{ validation },
                    });
                  }
                }}
              />
            </div>
            <InfoDetails summary={t("characterLimitWhenToUse.title")}>
              <div className="mt-4 mb-8 border-l-3 border-gray-500 pl-8">
                <p className="text-md mb-4">{t("characterLimitWhenToUse.text1")}</p>
                <p className="text-md mb-4">{t("characterLimitWhenToUse.text2")}</p>
                <p className="text-md">{t("characterLimitWhenToUse.text3")}</p>
              </div>
            </InfoDetails>
          </>
        )}
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};
