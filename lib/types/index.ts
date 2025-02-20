import { FormRecord, Responses, FormElementTypes } from "@gcforms/types";

export type {
  ConditionalRule,
  FormRecord,
  SecurityAttribute,
  FormPurpose,
  PublicFormRecord,
  Response,
  Responses,
  FileInputResponse,
  ElementProperties,
  ValidationProperties,
  DeliveryOption,
  FormProperties,
  FormElement,
  PropertyChoices,
  AddressComponents,
  BrandProperties,
  ClosedDetails,
} from "@gcforms/types";

import { FormikErrors } from "formik";
export { FormElementTypes };

export type { Submission, SubmissionRequestBody } from "./submission-types";

export type FormBuilderPageProps = {
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
  SearchParams,
} from "./utility-types";

export type {
  VaultSubmission,
  VaultSubmissionOverview,
  StartFromExclusiveResponse,
} from "./retrieval-types";

export { VaultStatus } from "./retrieval-types";

export type { FormOwner } from "./user-types";

export type { Abilities, Privilege, UserAbility, Permission, AnyObject } from "./privileges-types";

// Utility type creator
export type TypeOmit<Type, Key extends PropertyKey> = {
  [Property in keyof Type as Exclude<Property, Key>]: Type[Property];
};

export type { NagwareSubmission, NagwareResult } from "./nagware-types";
export { NagLevel } from "./nagware-types";

export interface Validate {
  validateForm: () => Promise<FormikErrors<Responses>>;
}
