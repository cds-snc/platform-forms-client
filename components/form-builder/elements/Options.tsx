import React, { ReactElement } from "react";
import PropTypes from "prop-types";
import useTemplateStore from "../store/useTemplateStore";
import { Option } from "./Option";
import { ElementType } from "../types";

const AddButton = ({ index, onClick }: { index: number; onClick: (index: number) => void }) => {
  return (
    <button
      style={{ marginTop: 20 }}
      className="gc-button"
      onClick={() => {
        onClick(index);
      }}
    >
      Add Option
    </button>
  );
};

AddButton.propTypes = {
  index: PropTypes.number,
  onClick: PropTypes.func,
};

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const Options = ({ item, renderIcon }: { item: ElementType; renderIcon?: RenderIcon }) => {
  const {
    form: { elements },
    addChoice,
  } = useTemplateStore();

  if (!elements[item.index!].properties) {
    return <AddButton index={item.index!} onClick={addChoice} />;
  }

  const { choices } = elements[item.index!].properties;

  if (!choices) {
    return <AddButton index={item.index!} onClick={addChoice} />;
  }

  const options = choices.map((child, index) => {
    if (!child || !item) return null;
    return (
      <Option
        renderIcon={renderIcon}
        parentIndex={item.index!}
        key={`child-${item.id}-${index}`}
        index={index}
      />
    );
  });

  return (
    <div>
      {options}
      <AddButton index={item.index!} onClick={addChoice} />
    </div>
  );
};

Options.propTypes = {
  item: PropTypes.object,
  renderIcon: PropTypes.func,
};
