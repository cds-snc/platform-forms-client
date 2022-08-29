import React, { useState, useCallback } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import useTemplateStore from "../store/useTemplateStore";
import { Select } from "../elements";
import { PanelActions } from "./PanelActions";
import { ElementOption, ElementType } from "../types";
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

const SelectedElement = ({ selected, item }: { selected: ElementOption; item: ElementType }) => {
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

const getSelectedOption = (item: ElementType): ElementOption => {
  const {
    form: { elements },
  } = useTemplateStore();
  const { type } = elements[item.index!];

  if (!type) {
    return elementOptions[2];
  }

  const selected = elementOptions.filter((item) => item.id === type);
  return selected && selected.length ? selected[0] : elementOptions[2];
};

const Row = styled.div`
  position: relative;
  justify-content: space-between;
  margin-right: 80px;
`;

const Input = styled.input`
  padding: 22px;
  width: 400px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  max-height: 36px;
`;

const Form = ({ item }: { item: ElementType }) => {
  const { updateField, resetChoices } = useTemplateStore();
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
        {item.type !== "richText" && (
          <Input
            type="text"
            name={`item${item.index}`}
            placeholder={`Question`}
            value={item.properties.titleEn}
            onChange={(e) => {
              updateField(`form.elements[${item.index}].properties.titleEn`, e.target.value);
              resetChoices(item.index!);
            }}
          />
        )}
        <Select
          options={elementOptions}
          selectedItem={selectedItem}
          onChange={handleElementChange}
        />
      </Row>
      <SelectedElement item={item} selected={selectedItem} />
    </>
  );
};

Form.propTypes = {
  item: PropTypes.object,
};

const ElementWrapper = styled.div`
  border: 2px solid #efefef;
  padding: 1.25em;
  position: relative;
  max-width: 800px;
  height: auto;
  margin-bottom: 20px;
`;

const CenterWrapper = styled.div`
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ElementPanel = () => {
  const {
    form: { elements },
    add,
  } = useTemplateStore();

  if (!elements.length) {
    return (
      <CenterWrapper>
        <button
          style={{ marginBottom: 20 }}
          className="gc-button gc-button--secondary"
          onClick={add}
        >
          Add form element
        </button>
      </CenterWrapper>
    );
  }

  return (
    <>
      {elements.map((element, index) => {
        const item = { ...element, index };
        return (
          <div key={item.id}>
            <ElementWrapper className={`element-${index}`}>
              <Form item={item} />
              <PanelActions item={item} />
            </ElementWrapper>
            <CenterWrapper>
              <button
                style={{ marginBottom: 20 }}
                className="gc-button gc-button--secondary"
                onClick={add}
              >
                Add form element
              </button>
            </CenterWrapper>
          </div>
        );
      })}
    </>
  );
};

ElementPanel.propTypes = {
  item: PropTypes.object,
};
