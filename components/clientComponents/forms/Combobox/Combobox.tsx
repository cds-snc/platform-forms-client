"use client";
import React from "react";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";
import { useAllowDuplicateAnnouncer, AllowDuplicateAnnouncer } from "@gcforms/announce";

interface ComboboxProps extends InputFieldProps {
  choices?: string[];
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { id, name, className, choices = [], required, ariaDescribedBy, lang } = props;
  const classes = cn("gc-combobox gcds-input-wrapper", className);
  const { t } = useTranslation("common", { lng: lang });

  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  const [items, setItems] = React.useState(choices);
  const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, selectedItem } =
    useCombobox({
      onInputValueChange({ inputValue }) {
        setItems(
          choices.filter((choice) => {
            return inputValue ? choice.toLowerCase().includes(inputValue.toLowerCase()) : true;
          })
        );
        setValue(inputValue);
      },
      items,
      onSelectedItemChange({ selectedItem }) {
        setValue(selectedItem);
      },
      initialInputValue: field.value || "",
      // Suppress downshift's built-in live region so we can customize announcements and
      // timing for better AT support
      getA11yStatusMessage: () => "",
    });
  // Announce either a) the option item count when results are available, or b) a no-results
  // message when the list is empty.
  const targetMessage = isOpen
    ? items.length > 0
      ? t("combobox-results-available", { count: items.length })
      : t("combobox-no-results")
    : "";

  const { bump, announcedMessage } = useAllowDuplicateAnnouncer({
    message: targetMessage,
    delayCondition: isOpen && items.length > 0,
    isActive: isOpen,
  });

  return (
    <>
      <div className={classes} data-testid="combobox" {...(lang && { lang })}>
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        {/* Keyboard/touch instructions for AT users, always rendered alongside any passed description. */}
        <span id={`${id}-hint`} className="sr-only">
          {t("combobox-input-hint")}
        </span>

        {/* Note: downshift manages role="combobox", aria-activedescendant, and aria-expanded */}
        <input
          {...getInputProps()}
          aria-describedby={`${ariaDescribedBy} ${id}-hint`}
          id={id}
          required={required}
          aria-required={required}
          {...(name && { name })}
          data-testid="combobox-input"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-labelledby={`label-${id}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />

        <AllowDuplicateAnnouncer id={id ?? ""} bump={bump} announcedMessage={announcedMessage} />

        {/* Ensure UL remains in the DOM so the aria-controls reference is never broken. */}
        {/* Note: downshift sets role="listbox"/"option". */}
        <ul
          {...getMenuProps()}
          tabIndex={-1}
          data-testid="combobox-listbox"
          hidden={!isOpen || items.length === 0}
          aria-labelledby={`label-${id}`}
        >
          {isOpen &&
            items.map((item, index) => (
              <li
                data-value={item}
                className={cn(
                  "min-h-[44px]",
                  highlightedIndex === index && "bg-gcds-blue-100",
                  selectedItem === item && "font-bold"
                )}
                key={item}
                {...getItemProps({ item, index })}
                onMouseDown={(e) => {
                  // Prevent Safari blur firing before click, which closes the list early.
                  e.preventDefault();
                }}
              >
                {item}
                {/* iOS VoiceOver doesn't reliably read aria-posinset/setsize. Inline position 
                    text as fallback. This technique was taken from GOV.UK accessible-autocomplete
                    and I don't fully understand it :) */}
                <span
                  style={{
                    border: 0,
                    clip: "rect(0 0 0 0)",
                    height: "1px",
                    marginBottom: "-1px",
                    marginRight: "-1px",
                    overflow: "hidden",
                    padding: 0,
                    position: "absolute",
                    whiteSpace: "nowrap",
                    width: "1px",
                  }}
                >
                  {` ${index + 1} ${t("combobox-of")} ${items.length}`}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
