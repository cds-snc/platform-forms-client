import { useReducer } from "react";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";

interface AuthErrorsState {
  title: string; // TODO used also for boolean logic. may want to add a isError or similar?
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
    logMessage.info("--------COGNITO ERROR ID:" + id); //TEMP -or- could be used for logging?
    const errorObj = { ...initialAuthErrorsState };
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
      case "CodeMismatchException":
        errorObj.title = t("CodeMismatchException"); // TODO ask design/content for error message
        break;
      case "ExpiredCodeException":
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
      payload: {
        title: errorObj.title,
        description: errorObj.description,
        callToActionText: errorObj.callToActionText,
        callToActionLink: errorObj.callToActionLink,
      },
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
