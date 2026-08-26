import { FormResponseSubmissions } from "../types";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  return formResponseSubmissions.submissions.map((response) => {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt).toISOString(),
      answers: response.answers.map((answer) => {
        if (answer.type === "starRating" && typeof answer.answer === "string") {
          try {
            const parsedAnswer = JSON.parse(answer.answer);
            if (
              parsedAnswer !== null &&
              typeof parsedAnswer === "object" &&
              "value" in parsedAnswer &&
              "numberOfStars" in parsedAnswer
            ) {
              return {
                ...answer,
                answer: parsedAnswer,
              };
            }
          } catch {
            // Not a valid star rating JSON object, return the original answer
          }
        }
        return answer;
      }),
    };
  });
};
