import { type JSX } from "react";
import { TFunction } from "i18next";
import { FormikProps } from "formik";

import { Language } from "@lib/types/form-builder-types";
import { Responses, PublicFormRecord, Validate } from "@lib/types";

export interface FormProps {
  formRecord: PublicFormRecord;
  initialValues?: Responses | undefined;
  language: string;
  isPreview?: boolean;
  renderSubmit?: ({
    validateForm,
    fallBack,
  }: {
    validateForm: Validate["validateForm"];
    fallBack?: () => JSX.Element;
  }) => JSX.Element;
  onSuccess: (id: string) => void;
  children?: (JSX.Element | undefined)[] | null;
  t: TFunction;
  allowGrouping?: boolean | undefined;
  groupHistory?: string[];
  matchedIds?: string[];
  saveSessionProgress: (language?: Language) => void;
  saveAndResume?: boolean;
}

export type InnerFormProps = FormProps & FormikProps<Responses>;
