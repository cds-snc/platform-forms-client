import { type Submission } from "../types";

export const getAnswerCounts = (submissions: Submission[]) => {
  const counts = submissions.map((response) => {
    return response.answers.length;
  });

  const allEqual = counts.every((val, i, arr) => val === arr[0]);

  return { counts, allEqual };
};
