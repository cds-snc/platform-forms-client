"use client";
import React, { createContext, useContext, useId } from "react";
import { cn } from "@lib/utils";
import { ExclamationIcon, WarningIcon } from "@serverComponents/icons";
import { TemplateStoreContext, useTemplateStore } from "@lib/store/useTemplateStore";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";

type FeedbackState = "error" | "conflict";

export const inputFeedbackPanelClassName =
  "has-[[data-feedback-state=error]]:bg-gray-50 has-[[data-feedback-state=error]]:focus-within:bg-gray-50 has-[[data-feedback-state=error]]:hover:bg-gray-50";

const InputFeedbackContext = createContext<{
  state?: FeedbackState;
  messageId?: string;
}>({});

const ConnectedInputFeedback = ({
  inputId,
  checkEmpty,
  children,
}: {
  inputId: string;
  checkEmpty?: string;
  children: React.ReactNode;
}) => {
  const { feedback, setInputFeedback } = useTemplateStore((state) => ({
    feedback: state.inputFeedback[inputId],
    setInputFeedback: state.setInputFeedback,
  }));
  return (
    <InputFeedback
      id={getErrorMessageId(inputId)}
      state={feedback?.state}
      message={feedback?.message}
      reservedMessage={checkEmpty}
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
          setInputFeedback(inputId, { state: "error", message: checkEmpty });
        } else if (feedback?.state === "error" && feedback.message === checkEmpty) {
          setInputFeedback(inputId, null);
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
  children,
}: {
  inputId: string;
  /** Localized error message for empty or whitespace-only values on blur. */
  checkEmpty?: string;
  children: React.ReactNode;
}) => {
  const store = useContext(TemplateStoreContext);
  return store ? (
    <ConnectedInputFeedback inputId={inputId} checkEmpty={checkEmpty}>
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
    controlClassName: state ? cn(state === "error" && errorControlClassName, "pr-10") : undefined,
    wrapperClassName: state === "error" ? errorControlClassName : undefined,
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
}: {
  /** Error message element id; defaults to a generated id. */
  id?: string;
  state?: FeedbackState;
  message?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  reservedMessage?: string;
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
              className={cn(
                "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2",
                state === "error" ? "text-red-default" : "text-(--gcds-color-yellow-700)"
              )}
            >
              {state === "error" ? (
                <ExclamationIcon className="size-5" />
              ) : (
                <WarningIcon className="size-5 fill-current" />
              )}
            </span>
          )}
        </div>
        {reservedMessage ? (
          // Persistent live region: blur errors appear after focus has moved on, so they must be announced.
          <p
            id={hasMessage ? messageId : undefined}
            role="alert"
            className={cn(
              "mt-1 text-sm wrap-anywhere",
              state === "error" ? "text-red-default" : "text-(--gcds-color-yellow-700)"
            )}
          >
            {hasMessage ? (
              message
            ) : (
              <span aria-hidden="true" className="invisible">
                {reservedMessage}
              </span>
            )}
          </p>
        ) : (
          hasMessage && (
            <p
              id={messageId}
              className={cn(
                "mt-1 text-sm wrap-anywhere",
                state === "error" ? "text-red-default" : "text-(--gcds-color-yellow-700)"
              )}
            >
              {message}
            </p>
          )
        )}
      </div>
    </InputFeedbackContext.Provider>
  );
};
