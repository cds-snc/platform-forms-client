import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { FormResponseSubmissions } from "../types";
import { FormElementTypes } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";

const specialChars = ["=", "+", "-", "@"];

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const { t } = customTranslate("common");

  const header = formResponseSubmissions.submissions[0].answers.map((item) => {
    return `${item.questionEn}\n${item.questionFr}${
      item.type === FormElementTypes.formattedDate && item.dateFormat
        ? "\n" +
          t(`formattedDate.${item.dateFormat}`, { lng: "en" }) +
          "/" +
          t(`formattedDate.${item.dateFormat}`, { lng: "fr" })
        : ""
    }`;
  });

  header.unshift(
    "Submission ID / Identifiant de soumission",
    "Date of submission / Date de soumission"
  );
  header.push("Receipt codes / Codes de réception");

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
                  if (answerText == "") {
                    answerText = "-";
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
        if (answerText == "") {
          answerText = "-";
        }
        return answerText;
      }),
      "Receipt codes are in the Official receipt and record of responses\n" +
        "Les codes de réception sont dans le Reçu et registre officiel des réponses",
    ];
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
