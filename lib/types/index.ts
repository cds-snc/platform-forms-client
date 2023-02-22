import { FormRecord } from "@lib/types";

export type {
  ValidationProperties,
  PropertyChoices,
  ElementProperties,
  FormElement,
  PublicFormRecord,
  DeliveryOption,
  FormRecord,
  FormProperties,
} from "./form-types";
export { FormElementTypes } from "./form-types";

export type { Submission, SubmissionRequestBody } from "./submission-types";

export type { Response, Responses, FileInputResponse } from "./form-response-types";

export type PageProps = {
  tab: string;
  initialForm: FormRecord | null;
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

export type { FormOwner } from "./user-types";

export type {
  Action,
  Subject,
  Abilities,
  Permission,
  Privilege,
  AnyObject,
  ForcedSubjectType,
} from "./privileges-types";
export type { AuditLogEvent, AuditLogEventStrings, AuditSubject } from "./auditLog-types";

export type {
  AuditLogAction,
  AuditLogActionStrings,
  AuditLogEvent,
  AuditLogEventStrings,
  AuditSubject,
} from "./auditLog-types";

// Utility type creator
export type TypeOmit<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };
