import React from "react";
import { Alert } from "@clientComponents/forms";
import { ErrorStatus } from "@lib/constants";
import { type Language } from "@lib/types/form-builder-types";
import { FormStatus } from "@gcforms/types";
import { SaveAndResumeButton } from "@clientComponents/forms/SaveAndResume/SaveAndResumeButton";
import { StatusError } from "../StatusError/StatusError";

import { type FormRenderProps } from "./types";

export const FormStatusAlerts = ({
  props,
  formStatusError,
  errorList,
  serverErrorId,
  errorId,
  language,
  formID,
}: {
  props: FormRenderProps;
  formStatusError: string | true | null;
  errorList: React.ReactNode;
  serverErrorId: string;
  errorId: string;
  language: string;
  formID: string;
}) => {
  const cta = props.saveAndResumeEnabled ? (
    <SaveAndResumeButton language={language as Language} />
  ) : null;

  return (
    <>
      {formStatusError && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={props.status?.heading ? props.status.heading : formStatusError}
          id={serverErrorId}
          focussable={true}
          cta={cta}
        >
          <>{props.status?.message && <p className="mb-4">{props.status?.message}</p>}</>
        </Alert>
      )}

      {props.status === FormStatus.SERVER_ID_ERROR && (
        <StatusError formId={formID} language={language as Language} />
      )}

      {errorList && (
        <Alert
          type={ErrorStatus.ERROR}
          heading={props.t("input-validation.heading", {
            lng: language,
          })}
          validation={true}
          id={errorId}
          focussable={true}
        >
          {errorList}
        </Alert>
      )}
    </>
  );
};
