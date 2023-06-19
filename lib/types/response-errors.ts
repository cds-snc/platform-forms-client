export enum ResponseStatus {
  success = "success",
  error = "error",
}

export interface ResponseErrorI {
  status: ResponseStatus;
  reason: ResponseErrors;
  // TODO:  Drop? determine on Client using the reason (code)
  message: string;
}

// TODO more
// -Cognito list of auth errors: https://github.com/aws-amplify/amplify-js/blob/main/packages/auth/src/Errors.ts
// -Cognito list of register errors: https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_SignUp.html#API_SignUp_Errors
export enum ResponseErrors {
  NotAuthorized = "NotAuthorized",
  PasswordResetRequired = "PasswordResetRequired",
  InternalServiceError = "InternalServiceError",
  CodeInvalid = "CodeInvalid",
  CodeExpired = "CodeExpired",
  PasswordValidationFailed = "PasswordValidationFailed",
  InvalidUsername = "InvalidUsername",
}

// Note: used with sanitzeCongintoError() to map to "safe" response error
export enum ResponseErrorsSensitive {
  UsernameExistsException = "UsernameExistsException",
  UsernotFoundException = "UsernotFoundException",
}
