import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { FormElementTypes, ElementProperties } from "@lib/types";

import { FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { Checkbox, Input, TextArea } from "../../shared";
import { useTemplateStore } from "../../store";

const FormLabel = styled.label`
  font-weight: 700;
  display: block;
  margin-bottom: 3px;
`;

const ModalRow = styled.div`
  margin-bottom: 20px;
`;

const HintText = styled.p`
  font-size: 16.5px;
  margin-bottom: 10px;
  line-height: 1.4;
  margin-top: -2px;
`;

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
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <ModalRow>
        <FormLabel htmlFor={`titleEn--modal--${item.index}`}>{t("question")}</FormLabel>
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
      </ModalRow>
      <ModalRow>
        <FormLabel>{t("description")}</FormLabel>
        <HintText>{t("descriptionDescription")}</HintText>
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
      </ModalRow>
      <ModalRow>
        <h3>{t("addRules")}</h3>
      </ModalRow>
      <ModalRow>
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
      </ModalRow>
      {item.type === FormElementTypes.textField &&
        (!item.properties.validation?.type || item.properties.validation?.type === "text") && (
          <ModalRow>
            <FormLabel htmlFor={`characterLength--modal--${item.index}`}>
              {t("maximumCharacterLength")}
            </FormLabel>
            <HintText>{t("characterLimitDescription")}</HintText>
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
          </ModalRow>
        )}
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};
