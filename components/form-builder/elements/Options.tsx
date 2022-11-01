import React, { useState, ReactElement, useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import useTemplateStore from "../store/useTemplateStore";
import { Option } from "./Option";
import { BulkAdd } from "./BulkAdd";
import { Button } from "../shared/Button";
import { ElementTypeWithIndex } from "../types";

const AddButton = ({ index, onClick }: { index: number; onClick: (index: number) => void }) => {
  const { t } = useTranslation("form-builder");
  return (
    <Button
      className="!m-0 !mt-4"
      theme="link"
      onClick={() => {
        onClick(index);
      }}
    >
      {t("addOption")}
    </Button>
  );
};

AddButton.propTypes = {
  index: PropTypes.number,
  onClick: PropTypes.func,
};

const BulkAddButton = ({ onClick }: { onClick: (onoff: boolean) => void }) => {
  const { t } = useTranslation("form-builder");
  return (
    <Button
      className="!m-0 !mt-4"
      theme="link"
      onClick={() => {
        onClick(true);
      }}
    >
      {t("addMultiple")}
    </Button>
  );
};

BulkAddButton.propTypes = {
  index: PropTypes.number,
  onClick: PropTypes.func,
};

const AddOptions = ({
  index,
}: // toggleBulkAdd,
{
  index: number;
  // toggleBulkAdd: (onoff: boolean) => void;
}) => {
  const { addChoice, setFocusInput } = useTemplateStore();

  return (
    <>
      <AddButton
        index={index}
        onClick={() => {
          setFocusInput(true);
          addChoice(index);
        }}
      />

      {/*  
      // feature removed for now
      <BulkAddButton index={index} onClick={toggleBulkAdd} /> 
      */}
    </>
  );
};

AddOptions.propTypes = {
  index: PropTypes.number,
};

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const Options = ({
  item,
  renderIcon,
}: {
  item: ElementTypeWithIndex;
  renderIcon?: RenderIcon;
}) => {
  const {
    form: { elements },
  } = useTemplateStore();

  const [bulkAddAction, setBulkAddAction] = useState(false);

  const toggleBulkAdd = useCallback(
    (toggle: boolean) => {
      setBulkAddAction(toggle);
    },
    [bulkAddAction]
  );

  const index = item.index;

  if (!elements[index].properties) {
    return null;
  }
  const { choices } = elements[index].properties;

  if (bulkAddAction) {
    return <BulkAdd index={index} toggleBulkAdd={toggleBulkAdd} choices={choices} />;
  }

  if (!choices) {
    return <AddOptions index={index} />;
  }

  const options = choices.map((child, index) => {
    if (!child || !item) return null;
    return (
      <Option
        renderIcon={renderIcon}
        parentIndex={item.index}
        key={`child-${item.id}-${index}`}
        index={index}
      />
    );
  });

  return (
    <div>
      {options}
      <AddOptions index={index} />
    </div>
  );
};

Options.propTypes = {
  item: PropTypes.object,
  renderIcon: PropTypes.func,
};
