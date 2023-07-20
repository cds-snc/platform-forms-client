import { FormikHelpers } from "formik";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";

export const useConfirmSecurityQuestions = (successCallback: () => void) => {
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const confirmSecurityQuestions = async (
    {
      username,
      question1,
      question2,
      question3,
    }: {
      username: string;
      question1: string;
      question2: string;
      question3: string;
    },
    {
      setSubmitting,
    }: FormikHelpers<{ username: string; question1: string; question2: string; question3: string }>
  ) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/account/securityquestions", {
        username,
        question1,
        question2,
        question3,
      });
      successCallback();
    } catch (err) {
      handleErrorById("InternalServiceExceptionLogin");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    confirmSecurityQuestions,
    authErrorsState,
    authErrorsReset,
  };
};
