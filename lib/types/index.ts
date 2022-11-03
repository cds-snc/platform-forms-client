export type {
  ValidationProperties,
  PropertyChoices,
  ElementProperties,
  FormElement,
  PublicFormRecord,
  SubmissionProperties,
  FormRecord,
  FormProperties,
} from "./form-types";
export { FormElementTypes } from "./form-types";

export type { Submission, SubmissionRequestBody } from "./submission-types";

export type { Response, Responses, FileInputResponse } from "./form-response-types";

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
} from "./utility-types";

export type { BearerTokenPayload, TemporaryTokenPayload, BearerResponse } from "./retrieval-types";

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

// Utility type creator
export type BetterOmit<T, K extends PropertyKey> = { [P in keyof T as Exclude<P, K>]: T[P] };
