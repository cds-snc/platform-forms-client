import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { FormElementTypes, ElementProperties } from "@lib/types";

import { FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { Checkbox, Input, TextArea } from "../shared";
import { useTemplateStore } from "../../store";

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

  return (
    <form
      className="modal-form"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
    >
      <div className="mb-2">
        <label htmlFor={`titleEn--modal--${item.index}`}>{t("question")}</label>
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
        <label>{t("description")}</label>
        <p className="hint">{t("descriptionDescription")}</p>
        <TextArea
          id={`description--modal--${item.index}`}
          placeholder={t("Description")}
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
      {item.type === FormElementTypes.textField &&
        (!item.properties.validation?.type || item.properties.validation?.type === "text") && (
          <div className="mb-2">
            <label htmlFor={`characterLength--modal--${item.index}`}>
              {t("maximumCharacterLength")}
            </label>
            <p className="hint">{t("characterLimitDescription")}</p>
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
        )}
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};
