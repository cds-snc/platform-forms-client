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
  errorEntriesList,
}: {
  inputs: string[];
  setInputs: (tag: string[]) => void;
  validateInput?: (tag: string) => boolean;
  spellCheck?: boolean;
  inputLabelId: string;
  maxEntries?: number;
  errors: DialogErrors;
  setErrors: React.Dispatch<React.SetStateAction<DialogErrors>>;
  errorEntriesList: string[];
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

  // TODO: handle duplicate entries?
  // TODO: should "backspace" on an empty input set the next entry into "edit mode"?
  // TODO: allow a comma separated list of codes to be pasted in?
  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    // Since the API only accepts lowercase UUID/FormId help the user out by ensuring lower case
    const text = (e.target as HTMLInputElement).value.trim().replace(",", "").toLowerCase();

    if (!text) {
      setErrors({ ...errors, invalidEntry: false });
    }

    // Allow backspace on an empty input to set the previous entry into "edit mode"
    if (!text && inputs.length && e.key === "Backspace") {
      (e.target as HTMLInputElement).value = `${inputs.at(-1)}`;
      setInputs([...new Set(inputs.slice(0, -1))]);
    }

    // Try to add the entry to the list of intries to submit to the server
    if (text && ["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();

      // On an entry error, tell the parent to show a related error
      if (validateInput && !validateInput(text)) {
        setErrors({ ...errors, invalidEntry: true });
      } else if (inputs.length >= maxEntries) {
        setErrors({ ...errors, maxEntries: true });
      } else if (errors?.maxEntries) {
        setErrors({ ...errors, maxEntries: false });
      } else {
        // Add the entry to the entry list and announce this to the user as well
        setInputs([...new Set([...inputs, text])]);
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = `${t("lineItemEntries.added")} ${text}`;
        }
        // Reset the inputs
        setErrors({ ...errors, invalidEntry: false });
        (e.target as HTMLInputElement).value = "";
      }
    }
  };

  // TODO: add entry error checking and showing errors here also?
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
        <LineItems values={inputs} onRemove={onRemove} errorEntriesList={errorEntriesList} />
      </ol>
      <div className="grow p-4">
        <input
          ref={inputRef}
          data-testid="value-input"
          className={
            "w-full p-1 outline-none " +
            (inputs.length > 0 ? "border-2 border-dashed border-grey" : "border-none") +
            (errors.invalidEntry ? " text-red" : "")
          }
          type="text"
          name="value-input"
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          spellCheck="false"
          autoComplete="off"
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
