import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { FormResponseSubmissions } from "../types";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const header = formResponseSubmissions.submissions[0].answers.map((item) => {
    return `${item.questionEn}\n${item.questionFr}`;
  });

  header.unshift("id", "created_at");
  header.push("code");

  const csvStringifier = createCsvStringifier({
    header: header,
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
                .map(
                  (subAnswer) =>
                    `${subAnswer.questionEn}\n${subAnswer.questionFr}: ${subAnswer.answer}\n`
                )
                .join("")
            )
            .join("\n");
        }
        return item.answer;
      }),
      "Get receipt codes in the Official record of responses to sign off on the removal of responses from GC Forms\n" +
        "Obtenez les codes de réception dans le registre officiel des réponses afin d'autoriser la suppression de réponses de Formulaires GC",
    ];
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
