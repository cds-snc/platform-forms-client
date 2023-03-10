import React from "react";
import { useSelect, UseSelectStateChange } from "downshift";
import { ElementOption } from "../../../types";
import { ChevronDown } from "../../../icons";

export const DropDown = ({
  items,
  selectedItem,
  onChange,
  ariaLabel,
}: {
  items: ElementOption[];
  selectedItem: ElementOption;
  onChange: (changes: UseSelectStateChange<ElementOption | null | undefined>) => void;
  ariaLabel: string;
}) => {
  const { isOpen, getToggleButtonProps, getMenuProps, highlightedIndex, getItemProps } = useSelect({
    items,
    selectedItem,
    onSelectedItemChange: onChange,
  });

  const headerProps = {
    ...getToggleButtonProps(),
    "aria-label": ariaLabel,
    "aria-labelledby": null,
  };

  return (
    <div
      className="builder-element-dropdown"
      style={{ position: "relative", zIndex: isOpen ? 20000 : 1 }}
    >
      <button data-testid="element-dropdown-select" className="header-button" {...headerProps}>
        {selectedItem && (
          <div className="selected" data-testid="element-select-active">
            {selectedItem.value}
            <ChevronDown />
          </div>
        )}
      </button>
      <ul {...getMenuProps()} style={{ display: isOpen ? "block" : "none" }}>
        {isOpen &&
          items.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                className={
                  highlightedIndex === index ? `highlighted ${item.className}` : item.className
                }
                key={`${item.id}-${index}`}
                {...getItemProps({ item, index })}
              >
                {item.icon && (
                  <Icon className={highlightedIndex === index ? "icon icon-highlighted" : "icon"} />
                )}
                <div
                  className={highlightedIndex === index ? "text highlighted" : "text"}
                  data-testid={item.id}
                >
                  {item.value}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
