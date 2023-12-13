import { FormRecord, Responses } from "@lib/types";
import { FormikErrors } from "formik";

export type {
  ValidationProperties,
  PropertyChoices,
  ElementProperties,
  FormElement,
  PublicFormRecord,
  DeliveryOption,
  FormRecord,
  FormProperties,
  SecurityAttribute,
  ConditionalRule,
} from "./form-types";
export { FormElementTypes } from "./form-types";

export type { Submission, SubmissionRequestBody } from "./submission-types";

export type { Response, Responses, FileInputResponse } from "./form-response-types";

export type PageProps = {
  tab: string;
  initialForm: FormRecord | null;
  publicForm: FormRecord | null;
  hasBrandingRequestForm: boolean;
};

export type {
  InputFieldProps,
  CharacterCountMessages,
  ChoiceFieldProps,
} from "./component-utility-types";

export type {
  LambdaResponse,
  UploadResult,
  MiddlewareReturn,
  MiddlewareRequest,
  MiddlewareProps,
  HTMLTextInputTypeAttribute,
  WithRequired,
} from "./utility-types";

export type {
  BearerTokenPayload,
  TemporaryTokenPayload,
  BearerResponse,
  VaultSubmission,
  VaultSubmissionList,
} from "./retrieval-types";

export { VaultStatus } from "./retrieval-types";

export type { FormOwner } from "./user-types";

export type { Abilities, Privilege, UserAbility, Permission, AnyObject } from "./privileges-types";

// Utility type creator
export type TypeOmit<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };

export type { NagwareSubmission, NagwareResult } from "./nagware-types";
export { NagLevel } from "./nagware-types";

export interface Validate {
  validateForm: () => Promise<FormikErrors<Responses>>;
}
