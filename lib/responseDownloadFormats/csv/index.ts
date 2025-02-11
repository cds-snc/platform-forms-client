import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { FormResponseSubmissions } from "../types";
import { FormElementTypes } from "@lib/types";
import { customTranslate } from "@lib/i18nHelpers";
import { sortByLayout } from "@lib/utils/form-builder";

const specialChars = ["=", "+", "-", "@"];

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const { t } = customTranslate("common");
  const { submissions } = formResponseSubmissions;

  const sortedElements = sortByLayout({
    layout: formResponseSubmissions.formRecord.form.layout,
    elements: formResponseSubmissions.formRecord.form.elements,
  }).filter((element) => ![FormElementTypes.richText].includes(element.type));

  const header = sortedElements.map((element) => {
    return `${element.properties.titleEn}\n${element.properties.titleFr}${
      element.type === FormElementTypes.formattedDate && element.properties.dateFormat
        ? "\n" +
          t(`formattedDate.${element.properties.dateFormat}`, { lng: "en" }) +
          "/" +
          t(`formattedDate.${element.properties.dateFormat}`, { lng: "fr" })
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

  const records = submissions.map((response) => {
    const answers = sortedElements.map((element) => {
      const answer = response.answers.find((answer) => answer.questionId === element.id);
      if (!answer) {
        return "-";
      }
      if (answer.answer instanceof Array) {
        return answer.answer
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
      let answerText = answer.answer;
      if (specialChars.some((char) => answerText.startsWith(char))) {
        answerText = `'${answerText}`;
      }
      if (answerText == "") {
        answerText = "-";
      }
      return answerText;
    });
    return [
      response.id,
      new Date(response.createdAt).toISOString(),
      ...answers,
      "Receipt codes are in the Official receipt and record of responses\n" +
        "Les codes de réception sont dans le Reçu et registre officiel des réponses",
    ];
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
