"use client";
import React, { useEffect, useRef, useState } from "react";
import { InputFieldProps } from "@lib/types";
import { useField } from "formik";
import { ErrorMessage } from "@clientComponents/forms";
import { useCombobox } from "downshift";
import { cn } from "@lib/utils";
import { useTranslation } from "@i18n/client";

interface ComboboxProps extends InputFieldProps {
  choices?: string[];
}

export const Combobox = (props: ComboboxProps): React.ReactElement => {
  const { id, name, className, choices = [], required, ariaDescribedBy, lang } = props;
  const classes = cn("gc-combobox gcds-input-wrapper", className);
  const { t } = useTranslation("common", { lng: lang });

  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  // GOV.UK "bump" pattern: two alternating aria-live regions guarantee a DOM
  // mutation on every announcement, even when the message text hasn't changed.
  // announcedMessage updates together with bump so each cycle fires AT once.
  const [bump, setBump] = useState(false);
  const [announcedMessage, setAnnouncedMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Suppress downshift's built-in live region; the bump regions below handle all announcements.
      getA11yStatusMessage: () => "",
    });

  // 400ms for no-results (query clearly done), 1400ms otherwise to avoid mid-keystroke noise.
  const announcementDelay = isOpen && items.length === 0 ? 400 : 1400;

  // Count only — aria-activedescendant handles option announcements during navigation.
  // Excluding the highlighted item also prevents targetMessage from changing on arrow keys.
  const targetMessage = isOpen
    ? items.length > 0
      ? t("combobox-results-available", { count: items.length })
      : t("combobox-no-results")
    : "";

  // Single debounced effect to avoid duplicate announcements.
  // Skip on initial open — VoiceOver announces aria-expanded natively.
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (justOpened) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAnnouncedMessage(targetMessage);
      setBump((b) => !b);
    }, announcementDelay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [targetMessage, announcementDelay, isOpen]);

  return (
    <>
      <div className={classes} data-testid="combobox" {...(lang && { lang })}>
        {meta.error && <ErrorMessage>{meta.error}</ErrorMessage>}

        {/* downshift manages role="combobox", aria-activedescendant, and aria-expanded */}
        <input
          {...getInputProps()}
          aria-describedby={ariaDescribedBy}
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

        {/* Dual alternating live regions (GOV.UK bump pattern) — ensures AT announces
            every update even when the message text repeats. */}
        <div id={`${id}-live-a`} aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? announcedMessage : ""}
        </div>
        <div id={`${id}-live-b`} aria-live="polite" aria-atomic="true" className="sr-only">
          {bump ? "" : announcedMessage}
        </div>

        {/* Always in DOM so aria-controls is never broken. downshift sets role="listbox"/"option". */}
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
                {/* iOS VoiceOver doesn't reliably read aria-posinset/setsize; inline position text as fallback. */}
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
