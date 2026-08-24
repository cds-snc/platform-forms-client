import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { FormResponseSubmissions } from "../types";
import { FormElementTypes } from "@lib/types";
import { serverTranslation } from "@i18n";
import { sortByLayout } from "@lib/utils/form-builder";
import { formattedStarRatingDefaultElementProperties } from "@clientComponents/forms/StarRating/defaults";
import { getStarRatingScoreFromObject } from "@clientComponents/forms/StarRating/utils";
import { StarRatingObject } from "@clientComponents/forms/StarRating/types";

const specialChars = ["=", "+", "-", "@"];

export const transform = async (formResponseSubmissions: FormResponseSubmissions) => {
  const { t: tEn } = await serverTranslation("common", { lang: "en" });
  const { t: tFr } = await serverTranslation("common", { lang: "fr" });

  const { submissions } = formResponseSubmissions;

  const richTextElements: FormElementTypes[] = [FormElementTypes.richText];

  const sortedElements = sortByLayout({
    layout: formResponseSubmissions.formRecord.form.layout,
    elements: formResponseSubmissions.formRecord.form.elements,
  }).filter((element) => !richTextElements.includes(element.type));

  const header = sortedElements.map((element) => {
    let columnTitle = `${element.properties.titleEn}\n${element.properties.titleFr}`;
    if (element.type === FormElementTypes.formattedDate && element.properties.dateFormat) {
      columnTitle +=
        "\n" +
        tEn(`formattedDate.${element.properties.dateFormat}`) +
        "\n" +
        tFr(`formattedDate.${element.properties.dateFormat}`);
    }
    if (element.type === FormElementTypes.starRating) {
      const numberOfStars =
        element.properties.numberOfStars ??
        formattedStarRatingDefaultElementProperties.numberOfStars;
      columnTitle +=
        "\n" +
        tEn("starRating.outOf", {
          value: "",
          numberOfStars,
        }).trim() +
        "\n" +
        tFr("starRating.outOf", {
          value: "",
          numberOfStars,
        }).trim();
    }
    return columnTitle;
  });

  header.unshift(
    "Submission ID \nIdentifiant de soumission",
    "Date of submission \nDate de soumission"
  );

  header.push("Receipt codes \nCodes de réception");

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

      if (element.type === FormElementTypes.starRating) {
        return getStarRatingScoreFromObject(JSON.parse(answerText) as StarRatingObject);
      }

      if (
        typeof answerText === "string" &&
        specialChars.some((char) => answerText.startsWith(char))
      ) {
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
