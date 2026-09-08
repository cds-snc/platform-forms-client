import { useEffect, useRef } from "react";
import { getErrorList, setFocusOnErrorMessage } from "@lib/validation/validation";
import { EventKeys } from "@lib/hooks/useCustomEvent";

import { type FormRenderProps } from "./types";

export const useFormErrorFocus = (
  props: FormRenderProps,
  formStatusError: string | true | null,
  errorList: ReturnType<typeof getErrorList> | null,
  errorId: string,
  serverErrorId: string
) => {
  const lastSubmitCountRef = useRef(props.submitCount);
  const focusOnValidationErrorRef = useRef(false);

  useEffect(() => {
    if (formStatusError) {
      setFocusOnErrorMessage(props, serverErrorId);
    }

    if (props.isValid) {
      lastSubmitCountRef.current = props.submitCount;
      return;
    }

    const shouldFocusValidationError =
      props.submitCount > lastSubmitCountRef.current || focusOnValidationErrorRef.current;

    if (shouldFocusValidationError) {
      lastSubmitCountRef.current = props.submitCount;
      focusOnValidationErrorRef.current = false;
      queueMicrotask(() => setFocusOnErrorMessage(props, errorId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStatusError, errorList, props.isValid, props.submitCount]);

  useEffect(() => {
    const handleContinueValidationError = () => {
      focusOnValidationErrorRef.current = true;
    };

    document.addEventListener(EventKeys.continueValidationError, handleContinueValidationError);

    return () => {
      document.removeEventListener(
        EventKeys.continueValidationError,
        handleContinueValidationError
      );
    };
  }, []);
};
