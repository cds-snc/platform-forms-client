import { FormStatus } from "@gcforms/types";

import { type FormRenderProps } from "./types";

export const getFormStatusError = (
  props: FormRenderProps,
  language: string,
  serverError: string,
  formClosedError: string
) => {
  if (typeof props.status === "object" && props.status !== null) {
    return true;
  }

  if (props.status === FormStatus.CAPTCHA_VERIFICATION_ERROR) {
    return null;
  }

  if (props.status === FormStatus.ERROR) {
    return serverError;
  }

  if (props.status === FormStatus.FORM_CLOSED_ERROR) {
    return (
      (language === "en"
        ? props.formRecord.closedDetails?.messageEn
        : props.formRecord.closedDetails?.messageFr) || formClosedError
    );
  }

  return null;
};
