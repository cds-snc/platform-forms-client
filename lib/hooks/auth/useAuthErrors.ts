import { useReducer } from "react";
import { useTranslation } from "next-i18next";

export interface AuthErrorsState {
  isError: boolean;
  title: string;
  description: string;
  callToActionText: string;
  callToActionLink: string;
}

interface AuthErrorsDispatch {
  authErrorsReset: () => void;
  handleErrorById: (id: string) => void;
}

export const useAuthErrors = (): [AuthErrorsState, AuthErrorsDispatch] => {
  const { t } = useTranslation("cognito-errors");

  enum AuthErrorsActions {
    RESET = "RESET",
    UPDATE = "UPDATE",
  }

  const initialAuthErrorsState = {
    isError: false,
    title: "",
    description: "",
    callToActionText: "",
    callToActionLink: "",
  };

  const authErrorsReducer = (
    state: AuthErrorsState,
    action: { type: string; payload?: AuthErrorsState }
  ) => {
    const { type, payload } = action;

    switch (type) {
      case AuthErrorsActions.RESET: {
        return initialAuthErrorsState;
      }
      case AuthErrorsActions.UPDATE: {
        return {
          ...state,
          ...payload,
        };
      }
      default:
        throw Error("Unknown action: " + action.type);
    }
  };

  const [authErrorsState, authErrorDispatch] = useReducer(
    authErrorsReducer,
    initialAuthErrorsState
  );

  const authErrorsReset = () => {
    authErrorDispatch({
      type: AuthErrorsActions.RESET,
    });
  };

  /**
   * Utility function to help simplify sending actions to the reducer. The passed Id is used to
   * find the error and send the related error object to update the reducer.
   *
   * @param id string used to find the error. Probably but not necessarily a cognito generated error
   */
  function handleErrorById(id: string) {
    const errorObj = {
      ...initialAuthErrorsState,
      isError: true,
    };
    switch (id) {
      // Custom and specific message. Would a more generic message be better?
      case "InternalServiceExceptionLogin":
        errorObj.title = t("InternalServiceExceptionLogin.title");
        errorObj.description = t("InternalServiceExceptionLogin.description");
        errorObj.callToActionText = t("InternalServiceExceptionLogin.linkText");
        errorObj.callToActionLink = t("InternalServiceExceptionLogin.link");
        break;
      case "UsernameOrPasswordIncorrect":
      case "UserNotFoundException":
      case "NotAuthorizedException":
        errorObj.title = t("UsernameOrPasswordIncorrect.title");
        errorObj.description = t("UsernameOrPasswordIncorrect.description");
        errorObj.callToActionLink = t("UsernameOrPasswordIncorrect.link");
        errorObj.callToActionText = t("UsernameOrPasswordIncorrect.linkText");
        break;
      case "UsernameExistsException":
        errorObj.title = t("UsernameExistsException"); // TODO ask design/content for error message
        break;
      case "IncorrectSecurityAnswerException":
        errorObj.title = t("IncorrectSecurityAnswerException.title");
        errorObj.description = t("IncorrectSecurityAnswerException.description");
        break;
      case "2FAInvalidVerificationCode":
      case "CodeMismatchException":
        errorObj.title = t("CodeMismatchException"); // TODO ask design/content for error message
        break;
      case "ExpiredCodeException":
      case "2FAExpiredSession":
        errorObj.title = t("ExpiredCodeException"); // TODO ask design/content for error message
        break;
      case "TooManyRequestsException":
        errorObj.title = t("TooManyRequestsException"); // TODO ask design/content for error message
        break;
      default:
        errorObj.title = t("InternalServiceException"); // TODO ask design/content for error message
    }
    authErrorDispatch({
      type: AuthErrorsActions.UPDATE,
      payload: errorObj,
    });
  }

  return [
    authErrorsState,
    {
      authErrorsReset,
      handleErrorById,
    },
  ];
};
