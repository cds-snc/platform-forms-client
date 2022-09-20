import React from "react";
import PropTypes from "prop-types";
import { useSelect, UseSelectStateChange } from "downshift";
import styled from "styled-components";
import { ElementOption, DropdownProps } from "../types";

const DropDownContainer = styled.div`
  width: 250px;
`;

const DropDownHeader = styled.button`
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  border: 1.5px solid #000000;
  width: 100%;
  line-height: 24px;

  &:focus,
  &[aria-expanded="true"] {
    border-color: #303fc3;
    box-shadow: 0 0 0 2.5px #303fc3;
    outline: 0;
  }
`;

const DropDownList = styled.ul`
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
  padding: 0px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 4px;
  margin: 0px;
  margin-top: 10px;
  list-style: none;
  background-color: #fff;
`;

const DropDownListItem = styled.li`
  display: flex;
  align-content: flex-start;
  background: ${(props: DropdownProps) => (props.ishighlighted ? "#f7f9ff" : "")};
  cursor: pointer;
  padding-left: 20px;
  padding-right: 26px;
  padding-bottom: 8px;
  padding-top: 8px;
`;

const DropDownListIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 10px;
  padding-top: 2px;
  text-align: left;
  height: 24px;
  overflow: hidden;
  width: 24px;
  display: inline-block;
  position: relative;
`;

const DropDownListLabel = styled.div`
  margin-left: 10px;
  color: #202124;
  line-height: 24px;
`;

export const DropDown = ({
  items,
  selectedItem,
  onChange,
}: {
  items: ElementOption[];
  selectedItem: ElementOption;
  onChange: (changes: UseSelectStateChange<ElementOption | null | undefined>) => void;
}) => {
  const { isOpen, getToggleButtonProps, getMenuProps, highlightedIndex, getItemProps } = useSelect({
    items,
    selectedItem,
    onSelectedItemChange: onChange,
  });

  return (
    <DropDownContainer style={{ zIndex: isOpen ? 20000 : 1 }}>
      <DropDownHeader {...getToggleButtonProps()}>
        {selectedItem && (
          <>
            <DropDownListIcon>{selectedItem.icon}</DropDownListIcon>
            <DropDownListLabel>{selectedItem.value}</DropDownListLabel>
          </>
        )}
      </DropDownHeader>
      <DropDownList {...getMenuProps()} style={{ display: isOpen ? "block" : "none" }}>
        {isOpen &&
          items.map((item, index) => (
            <div key={item.id}>
              <DropDownListItem
                ishighlighted={highlightedIndex === index}
                key={`${item.id}${index}`}
                {...getItemProps({ item, index })}
              >
                {item.icon && <DropDownListIcon>{item.icon}</DropDownListIcon>}
                <DropDownListLabel>{item.value}</DropDownListLabel>
              </DropDownListItem>
              {item.prepend && item.prepend}
            </div>
          ))}
      </DropDownList>
    </DropDownContainer>
  );
};

DropDown.propTypes = {
  items: PropTypes.array,
  onChange: PropTypes.func,
  selectedItem: PropTypes.object,
};

export const Select = ({
  options,
  selectedItem,
  onChange,
}: {
  options: ElementOption[];
  selectedItem: ElementOption;
  onChange: (changes: UseSelectStateChange<ElementOption | null | undefined>) => void;
}) => {
  return <DropDown items={options} selectedItem={selectedItem} onChange={onChange} />;
};

Select.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  selectedItem: PropTypes.object,
};
