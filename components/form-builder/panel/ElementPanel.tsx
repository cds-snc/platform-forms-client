import React, { useState, useCallback } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store/useTemplateStore";
import useModalStore from "../store/useModalStore";
import { Select } from "../elements";
import { PanelActions } from "./PanelActions";
import debounce from "lodash.debounce";
import {
  ElementOption,
  ElementProperties,
  ElementTypeWithIndex,
  LocalizedElementProperties,
  LocalizedFormProperties,
} from "../types";
import { UseSelectStateChange } from "downshift";
import { ShortAnswer, Options, RichText, RichTextLocked } from "../elements";
import { useElementOptions } from "../hooks/useElementOptions";
import { CheckBoxEmptyIcon, RadioEmptyIcon } from "../icons";
import { ModalButton } from "./Modal";
import { Checkbox } from "./MultipleChoice";
import { Button } from "../shared/Button";
import { Input } from "./Input";
import { ConfirmationDescription } from "./ConfirmationDescription";
import { PrivacyDescription } from "./PrivacyDescription";
import { QuestionInput } from "./QuestionInput";

const SelectedElement = ({
  selected,
  item,
}: {
  selected: ElementOption;
  item: ElementTypeWithIndex;
}) => {
  const { t } = useTranslation("form-builder");

  let element = null;

  switch (selected.id) {
    case "text":
    case "textField":
      element = <ShortAnswer>{t("Short answer text")}</ShortAnswer>;
      break;
    case "richText":
      element = <RichText parentIndex={item.index} />;
      break;
    case "textArea":
      element = <ShortAnswer>{t("Long answer text")}</ShortAnswer>;
      break;
    case "radio":
      element = <Options item={item} renderIcon={() => <RadioEmptyIcon />} />;
      break;
    case "checkbox":
      element = <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} />;
      break;
    case "dropdown":
      element = <Options item={item} renderIcon={(index) => `${index + 1}.`} />;
      break;
    case "email":
      element = <ShortAnswer>{t("example@canada.gc.ca")}</ShortAnswer>;
      break;
    case "phone":
      element = <ShortAnswer>555-555-0000</ShortAnswer>;
      break;
    case "date":
      element = <ShortAnswer>mm/dd/yyyy</ShortAnswer>;
      break;
    case "number":
      element = <ShortAnswer>0123456789</ShortAnswer>;
      break;
    default:
      element = null;
  }

  return element;
};

const getSelectedOption = (item: ElementTypeWithIndex): ElementOption => {
  const elementOptions = useElementOptions();
  const { validationType, type } = useTemplateStore(
    useCallback(
      (s) => {
        return {
          type: s.form.elements[item.index].type,
          validationType: s.form.elements[item.index].properties.validation.type,
        };
      },
      [item.index]
    )
  );

  let selectedType = type;

  if (!type) {
    return elementOptions[2];
  } else if (type === "textField") {
    /**
     * Email, phone, and date fields are specialized text field types.
     * That is to say, their "type" is "textField" but they have specalized validation "type"s.
     * So if we have a "textField", we want to first check properties.validation.type to see if
     * it is a true Short Answer, or one of the other types.
     * The one exception to this is validationType === "text" types, for which we want to return "textField"
     */
    selectedType = validationType && validationType !== "text" ? validationType : type;
  }

  const selected = elementOptions.filter((item) => item.id === selectedType);
  return selected && selected.length ? selected[0] : elementOptions[2];
};

interface RowProps {
  isRichText: boolean;
}

const Row = styled.div<RowProps>`
  display: flex;
  justify-content: space-between;
  position: relative;
  font-size: 16px;
  & > div {
    ${({ isRichText }) =>
      isRichText &&
      `
      width: 100%;
      margin: 0;
      font-size: 1.25em;
    `}
  }
`;

const TitleInput = styled(Input)`
  padding: 24px 10px 20px 10px;
  border: none;
  border-bottom: 1.5px solid #000000;
  border-radius: 4px 4px 0 0;
  font-weight: 700;
  font-size: 20px;

  &:focus {
    border-color: #000000;
    box-shadow: none;
    background: #ebebeb;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  width: 90%;
  border: 1.5px solid #000000;
  border-radius: 4px;

  &:focus {
    border-color: #303fc3;
    box-shadow: 0 0 0 2.5px #303fc3;
    outline: 0;
  }
`;

const DivDisabled = styled.div`
  margin-top: 20px;
  padding: 5px 10px;
  width: 460px;
  cursor: not-allowed;
  border-radius: 4px;
  background: #f2f2f2;
  color: #6e6e6e;
`;

const FormLabel = styled.label`
  font-weight: 700;
  display: block;
  margin-bottom: 3px;
`;

const LabelHidden = styled(FormLabel)`
  /* same as .sr-only */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const RequiredWrapper = styled.div`
  margin-top: 20px;

  span {
    display: inline-block;
    margin-left: 10px;
  }

  label {
    padding-top: 4px;
  }
`;

const Form = ({ item }: { item: ElementTypeWithIndex }) => {
  const isRichText = item.type == "richText";
  const { t } = useTranslation("form-builder");
  const elementOptions = useElementOptions();
  const { localizeField, elements, updateField, unsetField, resetChoices } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      elements: s.form.elements,
      updateField: s.updateField,
      unsetField: s.unsetField,
      resetChoices: s.resetChoices,
    })
  );

  const questionNumber =
    elements
      .filter((item) => item.type != "richText")
      .findIndex((object) => object.id === item.id) + 1;

  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const _updateState = (id: string, index: number) => {
    switch (id) {
      case "text":
      case "textField":
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(`form.elements[${index}].type`, "textField");

        if (id === "textField" || id === "text") {
          unsetField(`form.elements[${index}].properties.validation.type`);
        } else {
          updateField(`form.elements[${index}].properties.validation.type`, id);
          unsetField(`form.elements[${index}].properties.validation.maxLength`);
        }
        break;
      case "richText":
        resetChoices(index);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${index}].type`, id);
        unsetField(`form.elements[${index}].properties.validation.type`);
        unsetField(`form.elements[${index}].properties.validation.maxLength`);
        break;
    }
  };

  const handleElementChange = useCallback(
    ({ selectedItem }: UseSelectStateChange<ElementOption | null | undefined>) => {
      if (selectedItem) {
        setSelectedItem(selectedItem);
        _updateState(selectedItem.id, item.index);
      }
    },
    [setSelectedItem]
  );

  const hasDescription = item.properties[localizeField(LocalizedElementProperties.DESCRIPTION)];

  return (
    <>
      <Row isRichText={isRichText}>
        <div>
          {!isRichText && (
            <>
              <span className="absolute left-0 bg-gray-default py-2.5 px-1.5 rounded-r -ml-7">
                {questionNumber}
              </span>
              <LabelHidden htmlFor={`item${item.index}`}>{t("Question")}</LabelHidden>
              <QuestionInput
                initialValue={item.properties[localizeField(LocalizedElementProperties.TITLE)]}
                index={item.index}
                hasDescription={hasDescription}
              />
            </>
          )}
          {hasDescription && item.type !== "richText" && (
            <DivDisabled id={`item${item.index}-describedby`}>
              {item.properties[localizeField(LocalizedElementProperties.DESCRIPTION)]}
            </DivDisabled>
          )}
          <SelectedElement item={item} selected={selectedItem} />
          {item.properties.validation.maxLength && (
            <DivDisabled>
              {t("Max character length: ")}
              {item.properties.validation.maxLength}
            </DivDisabled>
          )}
        </div>
        {!isRichText && (
          <>
            <div>
              <Select
                options={elementOptions}
                selectedItem={selectedItem}
                onChange={handleElementChange}
              />
              <RequiredWrapper>
                <Checkbox
                  id={`required-${item.index}-id`}
                  value={`required-${item.index}-value`}
                  checked={item.properties.validation.required}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!e.target) {
                      return;
                    }

                    updateField(
                      `form.elements[${item.index}].properties.validation.required`,
                      e.target.checked
                    );
                  }}
                  label={t("Required")}
                ></Checkbox>
              </RequiredWrapper>
            </div>
          </>
        )}
      </Row>
    </>
  );
};

Form.propTypes = {
  item: PropTypes.object,
};

const ModalRow = styled.div`
  margin-bottom: 20px;
`;

const HintText = styled.p`
  font-size: 16.5px;
  margin-bottom: 10px;
  line-height: 1.4;
  margin-top: -2px;
`;

const ModalInput = styled(Input)`
  width: 90%;
`;

const ModalInputShort = styled(Input)`
  width: 180px;
`;

const ModalForm = ({
  item,
  properties,
  updateModalProperties,
  unsetModalField,
}: {
  item: ElementTypeWithIndex;
  properties: ElementProperties;
  updateModalProperties: (index: number, properties: ElementProperties) => void;
  unsetModalField: (path: string) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const localizeField = useTemplateStore((s) => s.localizeField);

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <ModalRow>
        <FormLabel htmlFor={`titleEn--modal--${item.index}`}>{t("Question")}</FormLabel>
        <ModalInput
          id={`titleEn--modal--${item.index}`}
          type="text"
          name={`item${item.index}`}
          placeholder={t("Question")}
          value={properties[localizeField(LocalizedElementProperties.TITLE)]}
          onChange={(e) =>
            updateModalProperties(item.index, {
              ...properties,
              ...{ local: e.target.value },
            })
          }
        />
      </ModalRow>
      <ModalRow>
        <FormLabel>{t("Description")}</FormLabel>
        <HintText>
          {t(
            "The description appears below the label, and before the field. It’s used to add context and instructions for the field. It’s a great place to specify formatting requirements."
          )}
        </HintText>
        <TextArea
          placeholder={t("Description")}
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
        <h3>Add rules</h3>
      </ModalRow>
      <ModalRow>
        <Checkbox
          id={`required-${item.index}-id-modal`}
          value={`required-${item.index}-value-modal`}
          checked={properties.validation.required}
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
          label={t("Required")}
        ></Checkbox>
      </ModalRow>
      {item.type === "textField" &&
        (!item.properties.validation.type || item.properties.validation.type === "text") && (
          <ModalRow>
            <FormLabel htmlFor={`characterLength--modal--${item.index}`}>
              {t("Maximum character length")}
            </FormLabel>
            <HintText>
              {t(
                "Only use a character limit when there is a good reason for limiting the number of characters users can enter."
              )}
            </HintText>
            <ModalInputShort
              id={`characterLength--modal--${item.index}`}
              type="number"
              min="1"
              value={properties.validation.maxLength || ""}
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

const ElementWrapperDiv = styled.div`
  border: 1.5px solid #000000;
  position: relative;
  max-width: 800px;
  height: auto;
  margin-top: -1px;
`;

export const ElementWrapper = ({ item }: { item: ElementTypeWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { elements, updateField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    elements: s.form.elements,
  }));

  const { isOpen, modals, updateModalProperties, unsetModalField } = useModalStore();

  React.useEffect(() => {
    if (item.type != "richText") {
      updateModalProperties(item.index, elements[item.index].properties);
    }
  }, [item, isOpen, isRichText]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ item, properties }: { item: ElementTypeWithIndex; properties: any }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      // replace all of "properties" with the new properties set in the ModalForm
      updateField(`form.elements[${item.index}].properties`, properties);
    };
  };

  return (
    <ElementWrapperDiv className={`element-${item.index}`}>
      <div className={isRichText ? "mt-7" : "mx-7 my-7"}>
        <Form item={item} />
      </div>
      <PanelActions
        item={item}
        renderSaveButton={() => (
          <ModalButton isOpenButton={false}>
            {modals[item.index] && (
              <Button
                className="mr-4"
                onClick={handleSubmit({ item, properties: modals[item.index] })}
              >
                {t("Save")}
              </Button>
            )}
          </ModalButton>
        )}
      >
        {!isRichText && modals[item.index] && (
          <ModalForm
            item={item}
            properties={modals[item.index]}
            updateModalProperties={updateModalProperties}
            unsetModalField={unsetModalField}
          />
        )}
      </PanelActions>
    </ElementWrapperDiv>
  );
};

const FormTitleInput = styled(TitleInput)`
  font-size: 30px;
  font-weight: 700;
  font-family: "Lato", sans-serif;
  width: 75%;
  margin-bottom: 16px;
`;

const ElementPanelDiv = styled.div`
  > div:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  > div:last-of-type,
  > div:last-of-type .panel-actions {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

export const ElementPanel = () => {
  const { t } = useTranslation("form-builder");
  const { title, elements, introduction, endPage, privacyPolicy, localizeField, updateField } =
    useTemplateStore((s) => ({
      title: s.localizeField(LocalizedFormProperties.TITLE),
      elements: s.form.elements,
      introduction: s.form.introduction,
      endPage: s.form.endPage,
      privacyPolicy: s.form.privacyPolicy,
      form: s.form,
      localizeField: s.localizeField,
      updateField: s.updateField,
    }));

  const [value, setValue] = useState<string>(title);

  const _debounced = useCallback(
    debounce((val) => {
      updateField(`form.${localizeField(LocalizedFormProperties.TITLE)}`, val);
    }, 1500),
    []
  );

  const updateValue = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      _debounced(e.target.value);
    },
    [setValue]
  );

  const introTextPlaceholder = introduction[localizeField(LocalizedElementProperties.DESCRIPTION)];

  const confirmTextPlaceholder = endPage[localizeField(LocalizedElementProperties.DESCRIPTION)];

  const policyTextPlaceholder =
    privacyPolicy[localizeField(LocalizedElementProperties.DESCRIPTION)];

  return (
    <ElementPanelDiv>
      <RichTextLocked
        beforeContent={
          <>
            <FormTitleInput
              placeholder={t("placeHolderFormTitle")}
              value={value}
              onChange={updateValue}
            />
            <p className="text-sm mb-4">{t("startFormIntro")}</p>
          </>
        }
        addElement={true}
        initialValue={introTextPlaceholder}
        schemaProperty="introduction"
        aria-label={t("richTextIntroTitle")}
      />
      {elements.map((element, index: number) => {
        const item = { ...element, index };
        return <ElementWrapper item={item} key={item.id} />;
      })}
      {elements?.length >= 1 && (
        <>
          <RichTextLocked
            addElement={false}
            initialValue={policyTextPlaceholder}
            schemaProperty="privacyPolicy"
            aria-label={t("richTextPrivacyTitle")}
          >
            <div>
              <h2 className="text-h3 pb-3">{t("richTextPrivacyTitle")}</h2>
              <PrivacyDescription />
            </div>
          </RichTextLocked>
          <RichTextLocked
            addElement={false}
            initialValue={confirmTextPlaceholder}
            schemaProperty="endPage"
            aria-label={t("richTextConfirmationTitle")}
          >
            <div>
              <h2 className="text-h3 pb-3">{t("richTextConfirmationTitle")}</h2>
              <ConfirmationDescription />
            </div>
          </RichTextLocked>
        </>
      )}
    </ElementPanelDiv>
  );
};

ElementPanel.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func,
};
