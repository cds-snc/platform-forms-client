import { FormResponseSubmissions } from "../types";
import { transform as transformAggregated } from "../html-aggregated";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const receipt = transformAggregated(formResponseSubmissions);
  const responses = formResponseSubmissions.submissions.map((response) => {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt).toISOString(),
      answers: response.answers,
    };
  });

  return {
    receipt,
    responses,
  };
};
