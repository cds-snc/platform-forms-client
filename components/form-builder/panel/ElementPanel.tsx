import React, { useState, useCallback } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";
import useTemplateStore from "../store/useTemplateStore";
import useModalStore from "../store/useModalStore";
import { Select } from "../elements";
import { PanelActions } from "./PanelActions";
import { ElementOption, ElementProperties, ElementTypeWithIndex } from "../types";
import { UseSelectStateChange } from "downshift";
import { ShortAnswer, Paragraph, Options, RichText } from "../elements";
import {
  ShortAnswerIcon,
  ParagraphIcon,
  RadioIcon,
  RadioEmptyIcon,
  CheckBoxEmptyIcon,
  CheckIcon,
  SelectMenuIcon,
} from "../icons";
import { ModalButton } from "./Modal";
import { FancyButton } from "./Button";

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
  { id: "dropdown", value: "Dropdown", icon: <SelectMenuIcon /> },
];

const SelectedElement = ({
  selected,
  item,
}: {
  selected: ElementOption;
  item: ElementTypeWithIndex;
}) => {
  let element = null;

  switch (selected.id) {
    case "textField":
      element = <ShortAnswer />;
      break;
    case "richText":
      element = <RichText parentIndex={item.index} />;
      break;
    case "textArea":
      element = <Paragraph />;
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
    default:
      element = null;
  }

  return element;
};

const getSelectedOption = (item: ElementTypeWithIndex): ElementOption => {
  const {
    form: { elements },
  } = useTemplateStore();
  const { type } = elements[item.index];

  if (!type) {
    return elementOptions[2];
  }

  const selected = elementOptions.filter((item) => item.id === type);
  return selected && selected.length ? selected[0] : elementOptions[2];
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Input = styled.input`
  padding: 22px 10px;
  width: 460px;
  border: 2px solid #000000;
  border-radius: 4px;
  max-height: 36px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  width: 90%;
  border: 2px solid #000000;
  border-radius: 4px;
`;

const TextAreaDisabled = styled(TextArea)`
  width: 460px;
  font-size: 16px;
  border: 2px solid #000000;
  cursor: not-allowed;
  background: #f2f2f2;
  color: #777777;
`;

const FormLabel = styled.label`
  font-weight: 700;
  display: block;
  margin-bottom: 3px;
`;

const FormLabelDisabled = styled(FormLabel)`
  margin-top: 10px;
  font-size: 16px;
  cursor: not-allowed;
`;

const FormWrapper = styled.div`
  padding: 1.25em;
`;

const RequiredWrapper = styled.div`
  margin-top: 20px;
  margin-left: 10px;

  & input {
    transform: scale(1.5);
    padding: 10px;
  }

  & span {
    display: inline-block;
    margin-left: 10px;
  }
`;

const Form = ({ item }: { item: ElementTypeWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const { updateField } = useTemplateStore();
  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const handleElementChange = useCallback(
    ({ selectedItem }: UseSelectStateChange<ElementOption | null | undefined>) => {
      selectedItem && setSelectedItem(selectedItem);
      selectedItem && updateField(`form.elements[${item.index}].type`, selectedItem?.id);
    },
    [setSelectedItem]
  );

  return (
    <>
      <Row>
        <div>
          <Select
            options={elementOptions}
            selectedItem={selectedItem}
            onChange={handleElementChange}
          />
          <RequiredWrapper>
            <label>
              <input
                checked={item.properties.validation.required}
                type="checkbox"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (!e.target) {
                    return;
                  }
                  updateField(
                    `form.elements[${item.index}].properties.validation.required`,
                    e.target.checked
                  );
                }}
              />{" "}
              <span>{t("Required")}</span>
            </label>
          </RequiredWrapper>
        </div>
        <div>
          {item.type !== "richText" && (
            <Input
              type="text"
              name={`item${item.index}`}
              placeholder={t("Question")}
              value={item.properties.titleEn}
              onChange={(e) => {
                updateField(`form.elements[${item.index}].properties.titleEn`, e.target.value);
              }}
            />
          )}
          {item.properties.descriptionEn && (
            <div>
              <FormLabelDisabled htmlFor={`description-${item.index}`}>
                {t("Description")}
              </FormLabelDisabled>
              <TextAreaDisabled
                id={`description-${item.index}`}
                value={item.properties.descriptionEn}
                disabled
              />
            </div>
          )}
          <SelectedElement item={item} selected={selectedItem} />
        </div>
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
    color: white;
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
  setProperties,
}: {
  item: ElementTypeWithIndex;
  properties: ElementProperties;
  setProperties: (properties: ElementProperties) => void;
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
            setProperties({
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
            setProperties({
              ...properties,
              ...{ descriptionEn: e.target.value },
            });
          }}
          value={properties.descriptionEn}
        />
      </ModalRow>
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};

const ElementWrapperDiv = styled.div`
  border: 2px solid #efefef;
  border-bottom: 2px solid black;
  padding-top: 10px;
  position: relative;
  max-width: 800px;
  height: auto;
`;

export const ElementWrapper = ({ item }: { item: ElementTypeWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const {
    form: { elements },
  } = useTemplateStore();

  const { isOpen } = useModalStore();
  const [properties, setProperties] = React.useState(elements[item.index].properties);

  React.useEffect(() => {
    setProperties((properties) => ({ ...properties, ...elements[item.index].properties }));
  }, [item, isOpen]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ item, properties }: { item: ElementTypeWithIndex; properties: any }) => {
    const { updateField } = useTemplateStore();
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
      <p>{JSON.stringify(isOpen)}: is open</p>
      <PanelActions
        item={item}
        renderSaveButton={() => (
          <ModalButton isOpenButton={false}>
            <ModalSaveButton onClick={handleSubmit({ item, properties })}>
              {t("Save")}
            </ModalSaveButton>
          </ModalButton>
        )}
      >
        <ModalForm item={item} properties={properties} setProperties={setProperties} />
      </PanelActions>
    </ElementWrapperDiv>
  );
};

export const ElementPanel = () => {
  const {
    form: { elements },
    add,
  } = useTemplateStore();

  if (!elements.length) {
    return (
      <button style={{ marginBottom: 20 }} className="gc-button gc-button--secondary" onClick={add}>
        Add form element
      </button>
    );
  }

  return (
    <>
      {elements.map((element, index) => {
        const item = { ...element, index };
        return (
          <div key={item.id}>
            <ElementWrapper item={item} />
          </div>
        );
      })}
    </>
  );
};

ElementPanel.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func,
};
