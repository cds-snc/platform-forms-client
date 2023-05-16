import { useReducer } from "react";
import { useTranslation } from "next-i18next";
// import { logMessage } from "@lib/logger";

// TODOs
// -instead of authErrorsState.title, add a isError for boolean logic?
// -ask design/content to help with rest of error messages in handleErrorById().

// NOTE
// -added logging to: confirm error

interface AuthErrorsState {
  title: string;
  description: string;
  callToActionText: string;
  callToActionLink: string;
}

interface AuthErrorsDispatchType {
  authErrorsReset: () => void;
  usernameOrPasswordIncorrect: () => void;
  internalServiceException: () => void;
  manualUpdate: ({
    title,
    description,
    callToActionText,
    callToActionLink,
  }: AuthErrorsState) => void;
  handleErrorById: (id: string) => void;
}

export const useAuthErrors = (): [AuthErrorsState, AuthErrorsDispatchType] => {
  const { t } = useTranslation("cognito-errors");

  enum errorsActions {
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
      case errorsActions.RESET: {
        return initialAuthErrorsState;
      }
      case errorsActions.UPDATE: {
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
      type: errorsActions.RESET,
    });
  };

  const usernameOrPasswordIncorrect = () => {
    authErrorDispatch({
      type: errorsActions.UPDATE,
      payload: {
        title: t("UsernameOrPasswordIncorrect.title"),
        description: t("UsernameOrPasswordIncorrect.description"),
        callToActionText: t("UsernameOrPasswordIncorrect.linkText"),
        callToActionLink: t("UsernameOrPasswordIncorrect.link"),
      },
    });
  };

  const internalServiceException = () => {
    authErrorDispatch({
      type: errorsActions.UPDATE,
      payload: {
        title: t("InternalServiceExceptionLogin.title"),
        description: t("InternalServiceExceptionLogin.description"),
        callToActionText: t("InternalServiceExceptionLogin.linkText"),
        callToActionLink: t("InternalServiceExceptionLogin.link"),
      },
    });
  };

  // TODO: would rather avoid this.
  const manualUpdate = ({
    title,
    description,
    callToActionText,
    callToActionLink,
  }: AuthErrorsState) => {
    authErrorDispatch({
      type: errorsActions.UPDATE,
      payload: {
        title,
        description,
        callToActionText,
        callToActionLink,
      },
    });
  };

  function handleErrorById(id: string) {
    // logMessage.error("--------COGNITO ERROR ID:" + id); //TEMP

    const errorObj = { ...initialAuthErrorsState };
    switch (id) {
      case "UsernameExistsException":
        errorObj.title = t("UsernameExistsException");
        break;
      case "CodeMismatchException":
        errorObj.title = t("CodeMismatchException");
        break;
      case "ExpiredCodeException":
        errorObj.title = t("ExpiredCodeException");
        break;
      case "TooManyRequestsException":
        errorObj.title = t("TooManyRequestsException");
        break;
      case "UserNotFoundException":
      case "NotAuthorizedException":
        errorObj.title = t("UsernameOrPasswordIncorrect.title");
        errorObj.description = t("UsernameOrPasswordIncorrect.description");
        errorObj.callToActionLink = t("UsernameOrPasswordIncorrect.link");
        errorObj.callToActionText = t("UsernameOrPasswordIncorrect.linkText");
        break;
      default:
        errorObj.title = t("InternalServiceException");
    }
    authErrorDispatch({
      type: errorsActions.UPDATE,
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
      usernameOrPasswordIncorrect,
      internalServiceException,
      manualUpdate,
      handleErrorById,
    },
  ];
};
