import React, { type JSX } from "react";
import { capitalize } from "./ResponseSection";
import { customTranslate, getProperty, orderLanguageStrings } from "@lib/i18nHelpers";
import { Answer, Submission } from "../../types";
import { TableProps } from "../types";
import { FormElementTypes, FormRecord } from "@lib/types";
import { formatUserInput } from "@lib/utils/strings";
import { Language } from "@lib/types/form-builder-types";
import { formatNumberInputAnswer } from "@lib/responseDownloadFormats/utils/formatNumberInputAnswer";

const QuestionRows = ({
  submission,
  lang,
  formRecord,
}: {
  submission: Submission;
  lang: Language;
  formRecord: FormRecord;
}): JSX.Element => {
  const { t } = customTranslate("common");
  const renderColumn = (index: number, lang: Language, item: Answer, subItem = false) => {
    const numberInputValue = formatNumberInputAnswer(item, lang, formRecord);
    return (
      <div
        key={`row-${index}`}
        className={`flex ${subItem ? "flex-row" : "flex-col"} border-gray border-b`}
      >
        <dt className="border-gray border-b-2 p-4 font-bold whitespace-nowrap">
          {String(item[getProperty("question", lang)])}
          {item.type === FormElementTypes.formattedDate && item.dateFormat ? (
            <>
              <br />
              {orderLanguageStrings({
                stringEn: t(`formattedDate.${item.dateFormat}`, { lng: "en" }),
                stringFr: t(`formattedDate.${item.dateFormat}`, { lng: "fr" }),
                lang,
              })}
            </>
          ) : (
            ""
          )}
        </dt>
        <dd className="p-4">
          {item.type === FormElementTypes.numberInput ? (
            <p>{numberInputValue}</p>
          ) : (
            <p dangerouslySetInnerHTML={{ __html: formatUserInput(String(item.answer)) }}></p>
          )}
        </dd>
      </div>
    );
  };

  const answers = submission.answers.map((item, index) => {
    if (typeof item.answer === "string") {
      return renderColumn(index, lang, item);
    } else if (typeof item.answer === "object" && !Array.isArray(item.answer)) {
      return renderColumn(index, lang, item);
    } else {
      return (
        <div key={"row" + index + lang}>
          <dt className="border-gray border-b-2 p-4 font-bold whitespace-nowrap">
            {String(item[getProperty("question", lang)])}
          </dt>
          <dd className="w-full p-4">
            <dl className="flex flex-col">
              {item.answer.map((subItem) => {
                return (
                  Array.isArray(subItem) &&
                  subItem.map((subSubItem, subIndex) => {
                    return renderColumn(subIndex, lang, subSubItem, true);
                  })
                );
              })}
            </dl>
          </dd>
        </div>
      );
    }
  });

  return <>{answers}</>;
};

export const RowTable = (props: TableProps): React.ReactElement => {
  const { t } = customTranslate("my-forms");
  const { responseID, submissionDate, submission, lang = "en", formRecord } = props;
  const formattedSubmissionDate =
    new Date(submissionDate).toISOString().replace("T", " ").slice(0, -5) + " UTC";

  return (
    <div className="overflow-x-scroll">
      <dl id={`responseTableRow${capitalize(lang)}`} className="border-gray flex border-y-2">
        <div className="flex flex-col">
          <dt className="border-gray flex border-b p-4 font-bold whitespace-nowrap">
            {t("responseTemplate.responseNumber", { lng: lang })}
          </dt>
          <dd className="p-4 whitespace-nowrap">{responseID}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="border-gray flex border-b p-4 font-bold whitespace-nowrap">
            {t("responseTemplate.submissionDate", { lng: lang })}
          </dt>
          <dd className="p-4 whitespace-nowrap">{formattedSubmissionDate}</dd>
        </div>
        <QuestionRows submission={submission} lang={lang} formRecord={formRecord} />
      </dl>
    </div>
  );
};
