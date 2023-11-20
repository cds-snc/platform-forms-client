import { FormResponseSubmissions } from "../types";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const responses = formResponseSubmissions.submissions.map((response) => {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt).toISOString(),
      answers: response.answers,
    };
  });

  return responses;
};
