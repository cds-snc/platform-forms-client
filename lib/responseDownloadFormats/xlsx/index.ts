import xlsx from "node-xlsx";
import { FormResponseSubmissions } from "../types";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const header = formResponseSubmissions.submissions[0].answers.map((item) => {
    return item.questionEn || "";
  });

  header.unshift("id", "created_at", "confirmation_code");

  const records = formResponseSubmissions.submissions.map((response) => {
    return [
      response.id,
      response.createdAt,
      response.confirmationCode,
      ...response.answers.map((item) => {
        if (item.answer instanceof Array) {
          return item.answer
            .map((answer) =>
              answer.map((subAnswer) => `${subAnswer.questionEn}: ${subAnswer.answer}\n`).join("")
            )
            .join("\n");
        }
        return item.answer;
      }),
    ];
  });

  records.unshift(header);

  return xlsx.build([{ name: "Responses", data: records, options: {} }]);
};
