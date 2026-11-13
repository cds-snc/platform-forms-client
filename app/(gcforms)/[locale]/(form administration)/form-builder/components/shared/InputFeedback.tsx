"use client";
import React, { createContext, useContext, useId } from "react";
import { cn } from "@lib/utils";
import { ExclamationIcon } from "@serverComponents/icons";
import { TemplateStoreContext, useTemplateStore } from "@lib/store/useTemplateStore";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";
import { getInputFeedbackKey } from "@lib/store/helpers/getInputFeedbackKey";

type FeedbackState = "error";

export const inputFeedbackPanelClassName =
  "has-[[data-feedback-state=error]]:bg-gray-50 has-[[data-feedback-state=error]]:focus-within:bg-gray-50 has-[[data-feedback-state=error]]:hover:bg-gray-50";

const InputFeedbackContext = createContext<{
  state?: FeedbackState;
  messageId?: string;
}>({});

export type CheckDuplicate = {
  /** Values the input must not exactly match, e.g. the other choices of the same question. */
  values: string[];
  /** Localized error message shown immediately when the value is a duplicate. */
  message: string;
};

type BlurChecks = {
  /** Localized error message for empty or whitespace-only values on blur. */
  checkEmpty?: string;
  checkDuplicate?: CheckDuplicate;
  /** Current input value, used to check duplicates as either choice changes. */
  value?: string | number;
};

const isDuplicate = (value: string, checkDuplicate?: CheckDuplicate) =>
  Boolean(checkDuplicate && value && checkDuplicate.values.includes(value));

const ConnectedInputFeedback = ({
  inputId,
  checkEmpty,
  checkDuplicate,
  value,
  children,
}: BlurChecks & {
  inputId: string;
  children: React.ReactNode;
}) => {
  const { localFeedback, templateFeedback, language, setInputFeedback } = useTemplateStore(
    (state) => {
      const language = state.translationLanguagePriority;
      const key = getInputFeedbackKey(inputId, language);
      return {
        localFeedback: state.inputFeedback[key],
        templateFeedback: state.templateProblemFeedback[key],
        language,
        setInputFeedback: state.setInputFeedback,
      };
    }
  );
  const duplicateFeedback =
    checkDuplicate && value !== undefined && isDuplicate(String(value), checkDuplicate)
      ? { state: "error" as const, message: checkDuplicate.message }
      : undefined;
  const feedback = duplicateFeedback ?? localFeedback ?? templateFeedback;
  const checks = Boolean(checkEmpty || checkDuplicate);

  return (
    <InputFeedback
      id={getErrorMessageId(inputId)}
      state={feedback?.state}
      message={feedback?.message}
      reservedMessage={checkEmpty}
      liveRegion={checks}
      onBlur={(event) => {
        const input = event.target;
        if (
          !checkEmpty ||
          input.id !== inputId ||
          !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)
        ) {
          return;
        }
        if (!input.value.trim()) {
          setInputFeedback(inputId, { state: "error", message: checkEmpty }, language);
        } else if (localFeedback?.message === checkEmpty) {
          setInputFeedback(inputId, null, language);
        }
      }}
    >
      {children}
    </InputFeedback>
  );
};

export const StoreInputFeedback = ({
  inputId,
  checkEmpty,
  checkDuplicate,
  value,
  children,
}: BlurChecks & {
  inputId: string;
  children: React.ReactNode;
}) => {
  const store = useContext(TemplateStoreContext);
  return store ? (
    <ConnectedInputFeedback
      inputId={inputId}
      checkEmpty={checkEmpty}
      checkDuplicate={checkDuplicate}
      value={value}
    >
      {children}
    </ConnectedInputFeedback>
  ) : (
    children
  );
};

const errorControlClassName =
  "border-red-default bg-red-50 focus:border-red-focus focus:outline-red-focus";

export const useInputFeedback = (describedBy?: string) => {
  const { state, messageId } = useContext(InputFeedbackContext);
  return {
    state,
    isInvalid: Boolean(state),
    describedBy: getDescribedByIds(messageId, describedBy),
    controlClassName: state ? cn(errorControlClassName, "pr-10") : undefined,
    wrapperClassName: state ? errorControlClassName : undefined,
  };
};

export const InputFeedback = ({
  id,
  state,
  message,
  children,
  className,
  onBlur,
  reservedMessage,
  liveRegion = Boolean(reservedMessage),
}: {
  /** Error message element id; defaults to a generated id. */
  id?: string;
  state?: FeedbackState;
  message?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  /** Invisible placeholder text that reserves space for a blur error to avoid layout shift. */
  reservedMessage?: string;
  /** Keep an always-present alert region so errors added after blur are announced. */
  liveRegion?: boolean;
}) => {
  const inheritedFeedback = useContext(InputFeedbackContext);
  const generatedId = useId();
  const messageId = id ?? generatedId;
  const hasMessage = Boolean(state && message);

  return (
    <InputFeedbackContext.Provider
      value={state ? { state, messageId: hasMessage ? messageId : undefined } : inheritedFeedback}
    >
      <div data-feedback-state={state} className={cn("min-w-0 flex-1", className)} onBlur={onBlur}>
        <div className="relative">
          {children}
          {state && (
            <span
              aria-hidden="true"
              className="text-red-default pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
            >
              <ExclamationIcon className="size-5" />
            </span>
          )}
        </div>
        {liveRegion ? (
          // Persistent live region: blur errors appear after focus has moved on, so they must be announced.
          <p
            id={hasMessage ? messageId : undefined}
            role="alert"
            className={cn(
              "text-red-default text-sm wrap-anywhere",
              (hasMessage || reservedMessage) && "mt-1"
            )}
          >
            {hasMessage
              ? message
              : reservedMessage && (
                  <span aria-hidden="true" className="invisible">
                    {reservedMessage}
                  </span>
                )}
          </p>
        ) : (
          hasMessage && (
            <p id={messageId} className="text-red-default mt-1 text-sm wrap-anywhere">
              {message}
            </p>
          )
        )}
      </div>
    </InputFeedbackContext.Provider>
  );
};
