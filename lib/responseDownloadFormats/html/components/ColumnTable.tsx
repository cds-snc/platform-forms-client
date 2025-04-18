import React, { type JSX } from "react";
import { capitalize } from "./ResponseSection";
import { customTranslate, orderLanguageStrings } from "../../../i18nHelpers";
import { Answer, Submission } from "../../types";
import { TableProps } from "../types";
import { formatDateTimeUTC } from "@lib/utils/form-builder";
import { FormElementTypes } from "@lib/types";
import { newLineToHtml } from "@lib/utils/newLineToHtml";

const QuestionColumns = ({
  submission,
  lang,
}: {
  submission: Submission;
  lang: string;
}): JSX.Element => {
  const { t } = customTranslate("common");

  const renderRow = (index: number, lang: string, item: Answer) => {
    return (
      <div className="flex w-full flex-row border-b border-gray py-4">
        <dt key="" className="w-96 py-4 font-bold">
          {orderLanguageStrings({ stringEn: item.questionEn, stringFr: item.questionFr, lang })}
          {item.type === FormElementTypes.formattedDate && item.dateFormat ? (
            <>
              <br />{" "}
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
        <dd
          className={`py-4 pl-8`}
          dangerouslySetInnerHTML={{ __html: newLineToHtml(item.answer) }}
        />
      </div>
    );
  };

  const answers = submission.answers.map((item, index) => {
    if (typeof item.answer === "string") {
      return renderRow(index, lang, item);
    } else {
      return (
        <div key={`col-${index}-${lang}`}>
          <dt className="w-full py-4 font-bold">
            {orderLanguageStrings({ stringEn: item.questionEn, stringFr: item.questionFr, lang })}
          </dt>
          <dd className="w-full py-4 pl-16">
            <dl className="ml-8">
              {item.answer.map((subItem) => {
                return (
                  Array.isArray(subItem) &&
                  subItem.map((subSubItem, subIndex) => {
                    return renderRow(subIndex, lang, subSubItem);
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

export const ColumnTable = (props: TableProps): React.ReactElement => {
  const { t } = customTranslate("my-forms");
  const { responseID, submissionDate, submission, lang = "en" } = props;

  return (
    <dl id={`responseTableCol${capitalize(lang)}`} className="border-y-2 border-gray">
      <div className="flex border-b border-gray py-4">
        <dt className="w-96 py-4 font-bold">
          {orderLanguageStrings({
            stringEn: t("responseTemplate.responseNumber", { lng: "en" }),
            stringFr: t("responseTemplate.responseNumber", { lng: "fr" }),
            lang,
          })}
        </dt>
        <dd className="py-4 pl-8">{responseID}</dd>
      </div>
      <div className="flex border-b border-gray py-4">
        <dt className="w-96 py-4 font-bold">
          {orderLanguageStrings({
            stringEn: t("responseTemplate.submissionDate", { lng: "en" }),
            stringFr: t("responseTemplate.submissionDate", { lng: "fr" }),
            lang,
          })}
        </dt>
        <dd className="py-4 pl-8">{formatDateTimeUTC(submissionDate)}</dd>
      </div>
      <QuestionColumns submission={submission} lang={lang} />
    </dl>
  );
};
