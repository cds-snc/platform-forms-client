"use client";

import React, { type ReactNode, useMemo, useState } from "react";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";

export interface SearchSelectorProps<T> {
  items: T[];
  selectedItem?: T | null;
  onResult: (item: T) => void;
  getItemKey: (item: T) => string | number;
  getItemLabel: (item: T) => string;
  renderResult?: (
    item: T,
    options: { isHighlighted: boolean; isSelected: boolean; searchTerm: string }
  ) => ReactNode;
  renderSelectedItem?: (item: T) => ReactNode;
  leadingIcon?: ReactNode;
  label?: ReactNode;
  placeholder?: string;
  noResultsMessage?: ReactNode;
  inputId?: string;
  className?: string;
}

export const SearchSelector = <T,>({
  items,
  selectedItem = null,
  onResult,
  getItemKey,
  getItemLabel,
  renderResult,
  renderSelectedItem,
  leadingIcon,
  label,
  placeholder = "Search",
  noResultsMessage = "No results",
  inputId,
  className,
}: SearchSelectorProps<T>) => {
  const selectedLabel = selectedItem ? getItemLabel(selectedItem) : "";
  const [inputValue, setInputValue] = useState(selectedLabel);
  const [isSearching, setIsSearching] = useState(!renderSelectedItem);
  const hasCustomDisplay = Boolean(renderSelectedItem && leadingIcon);

  const filteredItems = useMemo(() => {
    const normalizedInput = inputValue.trim().toLocaleLowerCase();
    if (!normalizedInput) return items;

    return items.filter((item) => getItemLabel(item).toLocaleLowerCase().includes(normalizedInput));
  }, [getItemLabel, inputValue, items]);

  const { isOpen, highlightedIndex, getInputProps, getItemProps, getMenuProps, getLabelProps } =
    useCombobox<T>({
      items: filteredItems,
      inputValue,
      selectedItem,
      itemToString: (item) => (item ? getItemLabel(item) : ""),
      onInputValueChange: ({ inputValue: nextInputValue }) => {
        setInputValue(nextInputValue ?? "");
        setIsSearching(true);
      },
      onSelectedItemChange: ({ selectedItem: nextSelectedItem }) => {
        if (nextSelectedItem) {
          onResult(nextSelectedItem);
          setIsSearching(false);
        }
      },
    });

  const inputProps = getInputProps({
    id: inputId,
    onBlur: () => {
      if (selectedItem) {
        setIsSearching(false);
      }
    },
    "aria-label": typeof label === "string" ? label : undefined,
  });

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label {...getLabelProps()} className="mb-2 block text-sm font-bold">
          {label}
        </label>
      )}
      {hasCustomDisplay && !isSearching ? (
        <>
          <button
            type="button"
            className={cn(
              "flex w-full items-start gap-3 rounded bg-transparent px-2 py-2 text-left focus:ring-2 focus:ring-blue-200 focus:outline-none",
              selectedItem ? "hover:bg-slate-50" : "text-slate-500"
            )}
            onClick={() => {
              setInputValue("");
              setIsSearching(true);
            }}
          >
            {leadingIcon}
            <span className={!selectedItem ? "font-bold" : undefined}>
              {selectedItem && renderSelectedItem ? renderSelectedItem(selectedItem) : placeholder}
            </span>
          </button>
          <input {...inputProps} className="absolute h-px w-px opacity-0" tabIndex={-1} />
        </>
      ) : (
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              {leadingIcon}
            </span>
          )}
          <input
            {...inputProps}
            className={cn(
              "text-black-default w-full rounded border-2 border-indigo-700 bg-white py-2 pr-3 focus:ring-2 focus:ring-blue-200 focus:outline-none",
              leadingIcon ? "pl-11" : "px-3"
            )}
            placeholder={placeholder}
            autoComplete="off"
            autoFocus={hasCustomDisplay && isSearching}
          />
        </div>
      )}
      <ul
        {...getMenuProps()}
        className={cn(
          "absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded border-2 border-indigo-700 bg-white p-1 shadow-lg",
          (!isOpen || filteredItems.length === 0) && "hidden"
        )}
      >
        {isOpen &&
          filteredItems.map((item, index) => {
            const isSelected =
              selectedItem !== null &&
              selectedItem !== undefined &&
              getItemKey(selectedItem) === getItemKey(item);

            return (
              <li
                {...getItemProps({
                  item,
                  index,
                  onMouseDown: (event) => event.preventDefault(),
                })}
                className={cn(
                  "cursor-pointer rounded border border-transparent px-3 py-2",
                  highlightedIndex === index && "border-gray-200 bg-gray-50",
                  isSelected && "font-semibold"
                )}
                key={getItemKey(item)}
              >
                {renderResult
                  ? renderResult(item, {
                      isHighlighted: highlightedIndex === index,
                      isSelected,
                      searchTerm: inputValue,
                    })
                  : getItemLabel(item)}
              </li>
            );
          })}
      </ul>
      {isOpen && filteredItems.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded border-2 border-indigo-700 bg-white p-3 shadow-lg">
          {noResultsMessage}
        </div>
      )}
    </div>
  );
};
