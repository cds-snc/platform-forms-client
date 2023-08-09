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
} from "./securityQuestions";

export {
  retrievePoolOfSecurityQuestions,
  createSecurityAnswers,
  updateSecurityAnswer,
  retrieveUserSecurityQuestions,
  validateSecurityAnswers,
  AlreadyHasSecurityAnswers,
  DuplicatedQuestionsNotAllowed,
  SecurityAnswersNotFound,
  SecurityQuestionNotFound,
  InvalidSecurityQuestionId,
  userHasSecurityQuestions,
} from "./securityQuestions";

export {
  sendPasswordResetLink,
  getPasswordResetAuthenticatedUserEmailAddress,
  PasswordResetInvalidLink,
  PasswordResetExpiredLink,
} from "./passwordReset";
