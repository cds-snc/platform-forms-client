import React, { useState, useCallback } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import useTemplateStore from "../store/useTemplateStore";
import { Select } from "../elements";
import { PanelActions } from "./PanelActions";
import { ElementOption, ElementTypeWithIndex } from "../types";
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
  padding: 22px;
  width: 460px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  max-height: 36px;
`;

const Label = styled.label`
  font-weight: 700;
  display: block;
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
              <span>Required</span>
            </label>
          </RequiredWrapper>
        </div>
        <div>
          {item.type !== "richText" && (
            <Input
              type="text"
              name={`item${item.index}`}
              placeholder={`Question`}
              value={item.properties.titleEn}
              onChange={(e) => {
                updateField(`form.elements[${item.index}].properties.titleEn`, e.target.value);
              }}
            />
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

const ModalForm = ({ item }: { item: ElementTypeWithIndex }) => {
  const { updateField, resetChoices } = useTemplateStore();

  return (
    <form>
      <Label htmlFor="titleEn">Question title</Label>
      <Input
        id="titleEn"
        type="text"
        name={`item${item.index}`}
        placeholder={`Question`}
        value={item.properties.titleEn}
        onChange={(e) => {
          updateField(`form.elements[${item.index}].properties.titleEn`, e.target.value);
          resetChoices(item.index);
        }}
      />
    </form>
  );
};

ModalForm.propTypes = {
  item: PropTypes.object,
};

const ElementWrapper = styled.div`
  border-left: 2px solid #efefef;
  border-right: 2px solid #efefef;
  border-top: 2px solid #efefef;
  border-bottom: 2px solid black;
  padding-top: 10px;
  position: relative;
  max-width: 800px;
  height: auto;
`;

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
            <ElementWrapper className={`element-${index}`}>
              <FormWrapper>
                <Form item={item} />
              </FormWrapper>

              <PanelActions item={item} />
            </ElementWrapper>
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
