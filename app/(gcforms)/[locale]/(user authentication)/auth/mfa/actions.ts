"use server";

export interface ErrorStates {
  authError?: {
    title: string;
    description?: string;
    callToActionText?: string;
    callToActionLink?: string;
  };
  validationErrors: {
    fieldKey: string;
    fieldValue: string;
  }[];
}

export const verify = async (
  language: string,
  username: string,
  authenticationFlowToken: string,
  _: ErrorStates,
  formData: FormData
): Promise<ErrorStates> => {
  // const rawFormData = Object.fromEntries(formData.entries());

  return {
    validationErrors: [],
  };
};
