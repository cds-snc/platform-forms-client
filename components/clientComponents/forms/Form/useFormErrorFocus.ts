import { useEffect, useRef, useState } from "react";
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
  // Keep this request render-driven; a ref alone can remain set until a later
  // input render and cause the validation summary to steal focus again
  const handledValidationErrorRequestRef = useRef(0);
  const [validationErrorRequest, requestValidationErrorFocus] = useState(0);

  useEffect(() => {
    if (formStatusError) {
      setFocusOnErrorMessage(props, serverErrorId);
    }

    if (props.isValid) {
      lastSubmitCountRef.current = props.submitCount;
      return;
    }

    const shouldFocusValidationError =
      props.submitCount > lastSubmitCountRef.current ||
      validationErrorRequest > handledValidationErrorRequestRef.current;

    if (shouldFocusValidationError) {
      lastSubmitCountRef.current = props.submitCount;
      handledValidationErrorRequestRef.current = validationErrorRequest;
      queueMicrotask(() => setFocusOnErrorMessage(props, errorId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formStatusError, errorList, props.isValid, props.submitCount, validationErrorRequest]);

  useEffect(() => {
    const handleContinueValidationError = () =>
      requestValidationErrorFocus((request) => request + 1);

    document.addEventListener(EventKeys.continueValidationError, handleContinueValidationError);

    return () => {
      document.removeEventListener(
        EventKeys.continueValidationError,
        handleContinueValidationError
      );
    };
  }, []);
};
