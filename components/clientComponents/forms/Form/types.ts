import { type JSX } from "react";
import type { TFunction } from "i18next";
import { FormikProps } from "formik";
import { Responses, PublicFormRecord, Validate } from "@lib/types";
import { Language } from "@lib/utils";

export interface FormProps {
  formRecord: PublicFormRecord;
  initialValues?: Responses | undefined;
  language: Language;
  isPreview?: boolean;
  renderSubmit?: ({
    validateForm,
    fallBack,
  }: {
    validateForm: Validate["validateForm"];
    fallBack?: () => JSX.Element;
  }) => JSX.Element;
  onSuccess: (id: string, submissionId?: string) => void;
  children?: (JSX.Element | undefined)[] | null;
  t: TFunction;
  saveAndResumeEnabled?: boolean;
  currentGroup: string | null;
  setCaptchaFail?: React.Dispatch<React.SetStateAction<boolean>>;
  captchaFail?: boolean;
}

export type FormWithFormikProps = FormProps &
  FormikProps<Responses> & {
    submitButtonRef: (element: HTMLButtonElement) => void;
  };

export type FormRenderProps = FormWithFormikProps & {
  captcha: React.ReactNode;
  captchaEnabled: boolean;
};
