import { useRouter } from "next/router";
import { FormikHelpers } from "formik";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";

export const useConfirmSecurityQuestions = (username: string, successCallback: () => void) => {
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const confirmSecurityQuestions = async (
    {
      username,
      answers,
    }: {
      username: string;
      answers: { id: string; answer: string }[] | [];
    },
    {
      setSubmitting,
    }: FormikHelpers<{ username: string; answers: { id: string; answer: string }[] | [] }>
  ) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/account/securityquestions", {
        username,
        answers,
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
    username,
    authErrorsState,
    authErrorsReset,
  };
};
