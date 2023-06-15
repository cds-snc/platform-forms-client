// TODO helpful to standardaize?
export enum ResponseStatus {
  success = "success",
  error = "error",
}

// TODO helpful to standardaize?
export interface ResponseErrorI {
  status: ResponseStatus; // TODO: Or is this redundant with the HTTP status Code?
  reason: ResponseErrors;
  message: string;
}

// TODO probably a lot missing
export enum ResponseErrors {
  // Use in place of "UsernotFound", this shouldn't be sent to the browser.
  NotAuthorized = "NotAuthorized",

  PasswordResetRequired = "PasswordResetRequired",

  InternalServiceError = "InternalServiceError",

  CodeInvalid = "CodeInvalid",

  CodeExpired = "CodeExpired",

  PasswordValidationFailed = "PasswordValidationFailed",

  // TODO: Ask Bryan if this makes sense?
  // Use in place of "UserNameExists", this shouldn't be sent to the browser.
  InvalidUsername = "InvalidUsername",
}
