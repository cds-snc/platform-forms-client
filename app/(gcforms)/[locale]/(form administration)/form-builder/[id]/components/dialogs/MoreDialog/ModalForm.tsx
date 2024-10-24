"use client";
import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";
import { FormElementTypes } from "@lib/types";

import { FormElementWithIndex, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { Checkbox, Input, TextArea, InfoDetails } from "@formBuilder/components/shared";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { AutocompleteDropdown } from "./AutocompleteDropdown";
import { AddressCompleteOptions } from "./AddressCompleteOptions";
import { FormattedDateOptions } from "./FormattedDateOptions";

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
  setItem,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const autocompleteSelectedValue = item.properties.autoComplete || "";
  const checked = item.properties.validation?.required;

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <section>
        <div className="mb-2">
          <ModalLabel htmlFor={`titleEn--modal--${item.index}`}>{t("question")}</ModalLabel>
          <Input
            id={`title--modal--${item.index}`}
            name={`item${item.index}`}
            placeholder={t("question")}
            value={
              item.properties[
                localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
              ]
            }
            className="w-11/12"
            onChange={(e) => {
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  ...{
                    [localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)]:
                      e.target.value,
                  },
                },
              });
            }}
          />
        </div>
        <div className="mb-2">
          <ModalLabel>{t("inputDescription")}</ModalLabel>
          <Hint>{t("descriptionDescription")}</Hint>
          <TextArea
            id={`description--modal--${item.index}`}
            placeholder={t("inputDescription")}
            testId="description-input"
            className="w-11/12"
            onChange={(e) => {
              const description = e.target.value.replace(/[\r\n]/gm, "");
              setItem({
                ...item,
                properties: {
                  ...item.properties,
                  ...{
                    [localizeField(
                      LocalizedElementProperties.DESCRIPTION,
                      translationLanguagePriority
                    )]: description,
                  },
                },
              });
            }}
            value={
              item.properties[
                localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
              ]
            }
          />
        </div>
      </section>
      {item.type === FormElementTypes.addressComplete && (
        <AddressCompleteOptions item={item} setItem={setItem} />
      )}
      {item.type === FormElementTypes.formattedDate && (
        <FormattedDateOptions item={item} setItem={setItem} />
      )}
      <section className="mb-4">
        <div className="mb-2">
          <h3>{t("addRules")}</h3>
        </div>
        <div>
          <Checkbox
            id={`required-${item.index}-id-modal`}
            value={`required-${item.index}-value-modal-` + checked}
            key={`required-${item.index}-modal-` + checked}
            defaultChecked={checked}
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
            label={t("required")}
          ></Checkbox>
        </div>
      </section>

      {/* @TODO: Come back and refactor to separate components */}
      {item.type === FormElementTypes.dynamicRow && (
        <section className="mb-4">
          <ModalLabel htmlFor={`maxNumberOfRows--modal--${item.index}`}>
            {t("maxNumberOfRows.label")}
          </ModalLabel>
          <Hint>{t("maxNumberOfRows.description")}</Hint>
          <Input
            id={`maxNumberOfRows--modal--${item.index}`}
            type="number"
            min="1"
            className="w-1/4"
            value={item.properties.maxNumberOfRows || ""}
            onKeyDown={(e) => {
              if (["-", "+", ".", "e"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // @TODO: is this still required / does this work? previous code used unsetModalField
              // if value is "", unset the field
              if (e.target.value === "") {
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    ...{ maxNumberOfRows: undefined },
                  },
                });
                return;
              }

              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1) {
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    ...{ maxNumberOfRows: value },
                  },
                });
              }
            }}
          />
        </section>
      )}

      {/* @TODO: Come back and refactor to separate components */}
      {item.type === FormElementTypes.textField && (
        <section className="mb-4 mt-8">
          <ModalLabel htmlFor="">{t("selectAutocomplete")}</ModalLabel>
          <Hint>{t("selectAutocompleteHint")}</Hint>
          <div>
            <AutocompleteDropdown
              handleChange={(e) => {
                setItem({
                  ...item,
                  properties: {
                    ...item.properties,
                    ...{ autoComplete: e.target.value },
                  },
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
        </section>
      )}

      {/* @TODO: Come back and refactor to separate components */}
      {[FormElementTypes.textField, FormElementTypes.textArea].includes(item.type) &&
        (!item.properties.validation?.type || item.properties.validation?.type === "text") && (
          <section className="mb-4">
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
                // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                //   // if value is "", unset the field
                //   if (e.target.value === "") {
                //     unsetModalField(`modals[${item.id}].validation.maxLength`);
                //     return;
                //   }

                //   const value = parseInt(e.target.value);
                //   if (!isNaN(value) && value >= 1) {
                //     // clone the existing properties so that we don't overwrite other keys in "validation"
                //     const validation = Object.assign({}, properties.validation, {
                //       maxLength: value,
                //     });
                //     updateModalProperties(item.id, {
                //       ...properties,
                //       ...{ validation },
                //     });
                //   }
                // }}
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
        )}
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};
