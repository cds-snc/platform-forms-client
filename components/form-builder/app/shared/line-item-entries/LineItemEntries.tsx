import React, { useEffect, useRef } from "react";
import { LineItems } from "./LineItems";
import { scrollToBottom } from "@lib/clientHelpers";
import { useTranslation } from "react-i18next";
import { DialogErrors } from "../../responses/DownloadTableDialog";

// Note: updates are done in a DIV live region to have more control and reduce the verbosity of
// what's announced -vs- just adding a live region on the OL which works but is painfully verbose.

export const LineItemEntries = ({
  inputs,
  setInputs,
  validateInput,
  inputLabelId,
  maxEntries = 20,
  errors,
  setErrors,
  listInvalidEntries,
}: {
  inputs: string[];
  setInputs: (tag: string[]) => void;
  validateInput?: (tag: string) => boolean;
  spellCheck?: boolean;
  inputLabelId: string;
  maxEntries?: number;
  errors: DialogErrors;
  setErrors: React.Dispatch<React.SetStateAction<DialogErrors>>;
  listInvalidEntries: string[];
}) => {
  const { t } = useTranslation("form-builder-responses");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const onRemove = (text: string) => {
    setInputs(inputs.filter((input) => input !== text));
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${t("lineItemEntries.removed")} ${text}`;
    }
    inputRef.current?.focus();
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");

    if (!text && inputs.length && e.key === "Backspace") {
      (e.target as HTMLInputElement).value = `${inputs.at(-1)}`;
      setInputs([...new Set(inputs.slice(0, -1))]);
    }

    if (text && ["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();

      // Tell parent to show an error if the maximum number of entries is reached
      if (inputs.length >= maxEntries) {
        // TODO: may want to disable form input as well to make it really clear
        setErrors({ ...errors, maxEntries: true });
        return;
      } else if (errors?.maxEntries) {
        setErrors({ ...errors, maxEntries: false });
      }

      // TODO: show an error if an entry is invalid
      if ((validateInput && !validateInput(text)) || inputs.length >= maxEntries) {
        return;
      }

      // Add the entry to the entry list and announce this to the user as well
      setInputs([...new Set([...inputs, text])]);
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `${t("lineItemEntries.added")} ${text}`;
      }

      (e.target as HTMLInputElement).value = "";
    }
  };

  const onBlur = (e: { target: HTMLInputElement }) => {
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "");
    if ((validateInput && !validateInput(text)) || inputs.length >= maxEntries) {
      return;
    }
    if (text) {
      setInputs([...new Set([...inputs, text])]);
      (e.target as HTMLInputElement).value = "";
    }
  };

  useEffect(() => {
    scrollToBottom(containerRef?.current as HTMLElement);
  }, [inputs]);

  return (
    <div
      ref={containerRef}
      className="max-h-60 overflow-y-auto box-border border-black-default border-2 rounded-md"
    >
      <ol data-testid="values">
        <LineItems values={inputs} onRemove={onRemove} listInvalidEntries={listInvalidEntries} />
      </ol>
      <div className="grow p-4">
        <input
          ref={inputRef}
          data-testid="value-input"
          className={
            "w-full p-1 outline-none " +
            (inputs.length > 0 ? "border-2 border-dashed border-grey" : "border-none")
          }
          type="text"
          name="value-input"
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          spellCheck="false"
          autoComplete="false"
          aria-labelledby={inputLabelId}
        />
      </div>
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="false"
        // aria-relevant="text additions" -- Note: default
      ></div>
    </div>
  );
};
