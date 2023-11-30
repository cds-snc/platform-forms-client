import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { FormResponseSubmissions } from "../types";

const specialChars = ["=", "+", "-", "@"];

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const header = formResponseSubmissions.submissions[0].answers.map((item) => {
    return `${item.questionEn}\n${item.questionFr}`;
  });

  header.unshift("id", "created_at");
  header.push("code");

  const csvStringifier = createCsvStringifier({
    header: header,
    alwaysQuote: true,
  });

  const records = formResponseSubmissions.submissions.map((response) => {
    return [
      response.id,
      new Date(response.createdAt).toISOString(),
      ...response.answers.map((item) => {
        if (item.answer instanceof Array) {
          return item.answer
            .map((answer) =>
              answer
                .map((subAnswer) => {
                  let answerText = `${subAnswer.questionEn}\n${subAnswer.questionFr}: ${subAnswer.answer}\n`;
                  if (specialChars.some((char) => answerText.startsWith(char))) {
                    answerText = `'${answerText}`;
                  }
                  return answerText;
                })
                .join("")
            )
            .join("\n");
        }
        let answerText = item.answer;
        if (specialChars.some((char) => answerText.startsWith(char))) {
          answerText = `'${answerText}`;
        }
        return answerText;
      }),
      "Receipt codes are in the Official receipt and record of responses\n" +
        "Les codes de réception sont dans le Reçu et registre officiel des réponses",
    ];
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
