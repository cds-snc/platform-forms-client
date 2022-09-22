import React, { useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import useTemplateStore from "../store/useTemplateStore";
import useModalStore from "../store/useModalStore";
import { Select } from "../elements";
import { PanelActions } from "./PanelActions";
import { ElementOption, ElementProperties, ElementTypeWithIndex } from "../types";
import { UseSelectStateChange } from "downshift";
import { ShortAnswer, Options, RichText, RichTextLocked } from "../elements";
import {
  CalendarIcon,
  CheckBoxEmptyIcon,
  CheckIcon,
  EmailIcon,
  ParagraphIcon,
  PhoneIcon,
  RadioIcon,
  RadioEmptyIcon,
  SelectMenuIcon,
  ShortAnswerIcon,
} from "../icons";
import { ModalButton } from "./Modal";
import { Checkbox } from "./MultipleChoice";
import { FancyButton } from "./Button";
import { Input } from "./Input";

const Separator = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: 8px 0;
`;

const elementOptions = [
  { id: "textField", value: "Short answer", icon: <ShortAnswerIcon /> },
  { id: "richText", value: "Rich Text", icon: <ParagraphIcon /> },
  { id: "textArea", value: "Paragraph", icon: <ParagraphIcon />, prepend: <Separator /> },
  { id: "radio", value: "Multiple choice", icon: <RadioIcon /> },
  { id: "checkbox", value: "Checkboxes", icon: <CheckIcon /> },
  { id: "dropdown", value: "Dropdown", icon: <SelectMenuIcon />, prepend: <Separator /> },
  { id: "email", value: "Email", icon: <EmailIcon /> },
  { id: "phone", value: "Phone number", icon: <PhoneIcon /> },
  { id: "date", value: "Date", icon: <CalendarIcon /> },
];

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
    default:
      element = null;
  }

  return element;
};

const getSelectedOption = (item: ElementTypeWithIndex): ElementOption => {
  const {
    form: { elements },
  } = useTemplateStore();
  let { type } = elements[item.index];

  if (!type) {
    return elementOptions[2];
  } else if (type === "textField") {
    /**
     * Email, phone, and date fields are specialized text field types.
     * That is to say, their "type" is "textField" but they have specalized validation "type"s.
     * So if we have a "textField", we want to first check properties.validation.type to see if
     * it is a true Short Answer, or one of the other types.
     */
    type = elements[item.index].properties.validation.type || type;
  }

  const selected = elementOptions.filter((item) => item.id === type);
  return selected && selected.length ? selected[0] : elementOptions[2];
};

interface RowProps {
  isRichText: boolean;
}

const Row = styled.div<RowProps>`
  display: flex;
  justify-content: space-between;
  position: relative;

  & div {
    ${({ isRichText }) =>
      isRichText &&
      `
      width: 100%;
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

const FormWrapper = styled.div`
  padding: 20px 25px;
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

const QuestionNumber = styled.span`
  position: absolute;
  background: #ebebeb;
  left: 0;
  margin-left: -25px;
  padding: 7px 4px;
  border-radius: 0 4px 4px 0;
  font-size: 20px;
`;

const Form = ({ item }: { item: ElementTypeWithIndex }) => {
  const isRichText = item.type == "richText";
  const { t } = useTranslation("form-builder");
  const {
    form: { elements },
    updateField,
    unsetField,
    resetChoices,
  } = useTemplateStore();

  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const questionNumber =
    elements
      .filter((item) => item.type != "richText")
      .findIndex((object) => object.id === item.id) + 1;

  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const _updateState = (id: string, index: number) => {
    switch (id) {
      case "email":
      case "phone":
      case "date":
        updateField(`form.elements[${index}].type`, "textField");
        updateField(`form.elements[${index}].properties.validation.type`, id);
        break;
      case "richText":
        resetChoices(index);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${index}].type`, id);
        unsetField(`form.elements[${index}].properties.validation.type`);
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

  return (
    <>
      <Row isRichText={isRichText}>
        <div>
          {!isRichText && (
            <>
              <QuestionNumber>{questionNumber}</QuestionNumber>
              <LabelHidden htmlFor={`item${item.index}`}>{t("Question")}</LabelHidden>
              <TitleInput
                ref={input}
                type="text"
                name={`item${item.index}`}
                placeholder={t("Question")}
                value={item.properties.titleEn}
                onChange={(e) => {
                  updateField(`form.elements[${item.index}].properties.titleEn`, e.target.value);
                }}
              />
            </>
          )}
          {item.properties.descriptionEn && item.type !== "richText" && (
            <DivDisabled aria-label={t("Description")}>{item.properties.descriptionEn}</DivDisabled>
          )}
          <SelectedElement item={item} selected={selectedItem} />
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

const ModalSaveButton = styled(FancyButton)`
  padding: 15px 20px;
  background: #26374a;
  box-shadow: inset 0 -2px 0 #515963;
  color: white;

  &:hover:not(:disabled),
  &:active,
  &:focus {
    color: #ffffff;
    background: #1c578a;
    box-shadow: inset 0 -2px 0 #7a8796;
  }

  &:hover:active {
    background: #16446c;
  }
`;

const ModalForm = ({
  item,
  properties,
  updateModalProperties,
}: {
  item: ElementTypeWithIndex;
  properties: ElementProperties;
  updateModalProperties: (index: number, properties: ElementProperties) => void;
}) => {
  const { t } = useTranslation("form-builder");

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <ModalRow>
        <FormLabel htmlFor={`titleEn--modal--${item.index}`}>{t("Question")}</FormLabel>
        <ModalInput
          id={`titleEn--modal--${item.index}`}
          type="text"
          name={`item${item.index}`}
          placeholder={t("Question")}
          value={properties.titleEn}
          onChange={(e) =>
            updateModalProperties(item.index, {
              ...properties,
              ...{ titleEn: e.target.value },
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
            updateModalProperties(item.index, {
              ...properties,
              ...{ descriptionEn: e.target.value },
            });
          }}
          value={properties.descriptionEn}
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
            updateModalProperties(item.index, {
              ...properties,
              ...{ validation: { required: e.target.checked } },
            });
          }}
          label={t("Required")}
        ></Checkbox>
      </ModalRow>
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};

const ElementWrapperDiv = styled.div`
  border: 1.5px solid #000000;
  padding-top: 10px;
  position: relative;
  max-width: 800px;
  height: auto;
  margin-top: -1px;
  font-size: 16px;
`;

export const ElementWrapper = ({ item }: { item: ElementTypeWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const {
    form: { elements },
    updateField,
  } = useTemplateStore();

  const { isOpen, modals, updateModalProperties } = useModalStore();

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
      <FormWrapper>
        <Form item={item} />
      </FormWrapper>
      <PanelActions
        item={item}
        renderSaveButton={() => (
          <ModalButton isOpenButton={false}>
            {modals[item.index] && (
              <ModalSaveButton onClick={handleSubmit({ item, properties: modals[item.index] })}>
                {t("Save")}
              </ModalSaveButton>
            )}
          </ModalButton>
        )}
      >
        {!isRichText && modals[item.index] && (
          <ModalForm
            item={item}
            properties={modals[item.index]}
            updateModalProperties={updateModalProperties}
          />
        )}
      </PanelActions>
    </ElementWrapperDiv>
  );
};

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
  const {
    form: { elements },
  } = useTemplateStore();

  const introTextPlaceholder = [
    {
      type: "paragraph",
      children: [{ text: "Add an introduction" }],
    },
  ];

  const confirmTextPlaceholder = [
    {
      type: "paragraph",
      children: [{ text: "Thank you for participating in the ice cream survey!" }],
    },
  ];

  const policyTextPlaceholder = [
    {
      type: "paragraph",
      children: [{ text: "Email addresses will not be shared." }],
    },
  ];

  return (
    <ElementPanelDiv>
      <RichTextLocked
        addElement={true}
        initialValue={introTextPlaceholder}
        schemaProperty="introduction"
      />
      {elements.map((element, index) => {
        const item = { ...element, index };
        return <ElementWrapper item={item} key={item.id} />;
      })}
      {elements?.length >= 1 && (
        <>
          <RichTextLocked
            addElement={false}
            initialValue={confirmTextPlaceholder}
            schemaProperty="endPage"
          >
            <h3>Confirmation page and message</h3>
          </RichTextLocked>
          <RichTextLocked
            addElement={false}
            initialValue={policyTextPlaceholder}
            schemaProperty="privacyPolicy"
          >
            <h3>Privacy statement</h3>
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
