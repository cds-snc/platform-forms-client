export {
  LoggingAction,
  requireAuthentication,
  isAuthenticated,
  validateTemporaryToken,
} from "./auth";

export { generateVerificationCode, sendVerificationCode } from "./2fa";

export { registerFailed2FAAttempt, clear2FALockout } from "./2faLockout";

export type { AuthenticationFlowToken, Validate2FAVerificationCodeResult } from "./cognito";

export {
  Validate2FAVerificationCodeResultStatus,
  initiateSignIn,
  begin2FAAuthentication,
  requestNew2FAVerificationCode,
  validate2FAVerificationCode,
  sanitizeEmailAddressForCognito,
} from "./cognito";

export type {
  SecurityQuestionId,
  SecurityQuestion,
  CreateSecurityAnswersCommand,
  UpdateSecurityAnswerCommand,
  ValidateSecurityAnswersCommand,
} from "./securityQuestions/securityQuestions";

export {
  retrievePoolOfSecurityQuestions,
  createSecurityAnswers,
  updateSecurityAnswer,
  retrieveUserSecurityQuestions,
  userHasSecurityQuestions,
  validateSecurityAnswers,
  AlreadyHasSecurityAnswers,
  DuplicatedQuestionsNotAllowed,
  SecurityAnswersNotFound,
  SecurityQuestionNotFound,
  InvalidSecurityQuestionId,
  SecurityQuestionDatabaseOperationFailed,
} from "./securityQuestions/securityQuestions";

export {
  sendPasswordResetLink,
  getPasswordResetAuthenticatedUserEmailAddress,
  PasswordResetInvalidLink,
  PasswordResetExpiredLink,
} from "./passwordReset";
