import { FormResponseSubmissions } from "../types";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  return formResponseSubmissions.submissions.map((response) => {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt).toISOString(),
      confirmationCode: response.confirmationCode,
      answers: response.answers,
    };
  });
};
