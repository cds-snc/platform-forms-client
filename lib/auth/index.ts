export { generateVerificationCode, sendVerificationCode } from "./2fa";

export { registerFailed2FAAttempt, clear2FALockout } from "./2faLockout";

export type { AuthenticationFlowToken, Validate2FAVerificationCodeResult } from "./cognito";

export {
  initiateSignIn,
  begin2FAAuthentication,
  requestNew2FAVerificationCode,
  validate2FAVerificationCode,
  sanitizeEmailAddressForCognito,
} from "./cognito";

export type {
  SecurityQuestionId,
  SecurityQuestion,
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

export { GET, POST, auth, signIn, signOut } from "./nextAuth";

import { getAbility } from "@lib/privileges";

// Creates a new custom Error Class
export class AccessControlError extends Error {
  public user: {
    id: Promise<string>;
  } = {
    id: getAbility()
      .then((ability) => ability.userID)
      .catch(() => "unauthenticated"),
  };

  constructor(message: string = "AccessControlError") {
    super(message);
    Object.setPrototypeOf(this, AccessControlError.prototype);
  }
}
