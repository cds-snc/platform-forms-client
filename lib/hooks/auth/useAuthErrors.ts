import { useReducer } from "react";
import { useTranslation } from "next-i18next";

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
}

export const useAuthErrors = (): [AuthErrorsState, AuthErrorsDispatchType] => {
  const { t } = useTranslation("cognito-errors");

  enum errorsActions {
    RESET = "RESET",
    UPDATE = "UPDATE",
  }

  const initialAuthErrorState = {
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
        return initialAuthErrorState;
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

  const [authErrorState, authErrorDispatch] = useReducer(authErrorsReducer, initialAuthErrorState);

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

  return [
    authErrorState,
    { authErrorsReset, usernameOrPasswordIncorrect, internalServiceException, manualUpdate },
  ];
};
