import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes, Response } from "@lib/types";
import { capitalize } from "./ResponseSection";

// Note: For the layout why DL or Table? The DL element fits a list structure better and is
// announced as a list by most screen readers when nested. A Table with 1 row/col of data is a bit
// weird as a table and when nested is announced differently depending on the screen reader. After
// implementing and testing both DL and Table they worked similarly. After some back and forth, DL
// was decided. Though if a Table is needed/desired in the future, the implementation is simple and
// one render function can be used and the table orientation changed using CSS (flex).

// Note: some Tailwind classes classes related to widths were not "working" embeded, so some styles
// were hardcoded.

// Note: the use of CSS min-width and max-width is used to force an element width contained in an
// overflow.

export interface TableProps {
  isRowTable?: boolean;
  lang?: string;
  responseID: string;
  submissionDate: number;
  // submissionID: string;
  questionsAnswers: {
    question: string;
    response:
      | {
          question: string;
          response: Response[];
          questionType: FormElementTypes;
        }[]
      | Response;
    questionType: FormElementTypes;
  }[];
}

const formatColumnAnswers = (
  question: string,
  response: Response | Response[],
  parentIndex: number | string,
  lang: string
) => {
  if (Array.isArray(response)) {
    return (
      <div key={`col-${parentIndex}-${lang}`} className="flex border-b border-grey-default">
        <dt className="py-4 font-bold" style={{ width: "20rem" }}>
          {question}
        </dt>
        <dd className="py-4">
          {response.map((subItem, subIndex) => (
            <p key={`${parentIndex}-${subIndex}`}>{subItem.toString() || "-"}</p>
          ))}
        </dd>
      </div>
    );
  } else {
    return (
      <div key={`col-${parentIndex}-${lang}`} className="flex border-b border-grey-default">
        <dt className="py-4 font-bold" style={{ width: "30rem" }}>
          {question}
        </dt>
        <dd className="py-4">
          <p>{response.toString() || "-"}</p>
        </dd>
      </div>
    );
  }
};

const formatRowAnswers = (
  question: string,
  response: Response | Response[],
  parentIndex: number | string,
  lang: string
) => {
  if (Array.isArray(response)) {
    return (
      <div
        key={`row-${parentIndex}-${lang}`}
        className="flex flex-col"
        style={{ minWidth: "40rem", maxWidth: "40rem" }}
      >
        <dt className="font-bold border-b border-grey-default py-4">{question}</dt>
        <dd className="py-4">
          {response.map((subItem, subIndex) => (
            <p key={`${parentIndex}-${subIndex}`}>{subItem.toString() || "-"}</p>
          ))}
        </dd>
      </div>
    );
  } else {
    return (
      <div
        key={`row-${parentIndex}-${lang}`}
        className="flex flex-col"
        style={{ minWidth: "60rem", maxWidth: "60rem" }}
      >
        <dt className="flex items-center font-bold border-b border-grey-default py-4 pr-8">
          {question}
        </dt>
        <dd className="py-4 pr-8">
          <p>{response.toString() || "-"}</p>
        </dd>
      </div>
    );
  }
};

const QuestionRows = ({
  questionsAnswers,
  lang,
}: {
  questionsAnswers: {
    question: string;
    response:
      | {
          question: string;
          response: Response[];
          questionType: FormElementTypes;
        }[]
      | Response;
    questionType: FormElementTypes;
  }[];
  lang: string;
}): JSX.Element => {
  const buildRows = questionsAnswers.map(({ question, response, questionType }, index) => {
    if (questionType === FormElementTypes.dynamicRow) {
      const dynamicRowResponse = response as {
        question: string;
        response: Response[];
        questionType: FormElementTypes;
      }[];

      return (
        <div
          key={"row" + index + lang}
          style={{
            minWidth: `${20 * dynamicRowResponse.length}rem`,
            maxWidth: `${20 * dynamicRowResponse.length}rem`,
          }}
        >
          <dt className="py-4 font-bold border-b-2 border-grey-default">{question}</dt>
          <dd className="py-4">
            <dl className="flex flex-row">
              {dynamicRowResponse.map((item, subindex) => {
                return formatRowAnswers(item.question, item.response, `${index}-${subindex}`, lang);
              })}
            </dl>
          </dd>
        </div>
      );
    }
    return formatRowAnswers(question, response, index, lang);
  });
  return <>{buildRows.map((item) => item)}</>;
};

const QuestionColumns = ({
  questionsAnswers,
  lang,
}: {
  questionsAnswers: {
    question: string;
    response:
      | {
          question: string;
          response: Response[];
          questionType: FormElementTypes;
        }[]
      | Response;
    questionType: FormElementTypes;
  }[];
  lang: string;
}): JSX.Element => {
  const buildRows = questionsAnswers.map(({ question, response, questionType }, index) => {
    if (questionType === FormElementTypes.dynamicRow) {
      const dynamicRowResponse = response as {
        question: string;
        response: Response[];
        questionType: FormElementTypes;
      }[];

      const dynamicRowQuestions = dynamicRowResponse.map((item) => item.question);

      const dynamicRow = [];

      // Length of response array let's us know how many time the dynamic group is repeated
      for (let i = 0; i < dynamicRowResponse[0].response.length; i++) {
        dynamicRow.push(
          ...dynamicRowQuestions.map((q, index) => ({
            question: q,
            response: dynamicRowResponse[index].response[i],
          }))
        );
      }

      return (
        <div key={"col" + index + lang}>
          <dt className="w-full py-4 font-bold border-b-2 border-grey-default">{question}</dt>
          <dd className="w-full py-4">
            <dl className="ml-8">
              {dynamicRow.map((item, subindex) => {
                return formatColumnAnswers(
                  item.question,
                  item.response,
                  `${index}-${subindex}`,
                  lang
                );
              })}
            </dl>
          </dd>
        </div>
      );
    }
    return formatColumnAnswers(question, response, index, lang);
  });
  return <>{buildRows.map((item) => item)}</>;
};

export const Table = (props: TableProps): React.ReactElement => {
  const { t } = useTranslation(["my-forms"]);
  const {
    responseID,
    submissionDate,
    questionsAnswers,
    isRowTable = true,
    lang = "en",
    // submissionID,
  } = props;

  return (
    <>
      {!isRowTable && (
        <dl
          id={`responseTableCol${capitalize(lang)}`}
          className="border-b-2 border-t-2 border-grey-default"
        >
          <div className="flex border-b border-grey-default">
            <dt className="font-bold py-4" style={{ width: "30rem" }}>
              {t("responseTemplate.responseNumber", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] py-4">{responseID}</dd>
          </div>
          <div className="flex border-b border-grey-default">
            <dt className="font-bold py-4" style={{ width: "30rem" }}>
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] py-4">
              {new Date(submissionDate).toLocaleString(`${lang + "-CA"}`, {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })}
            </dd>
          </div>
          <QuestionColumns questionsAnswers={questionsAnswers} lang={lang} />
        </dl>
      )}
      {isRowTable && (
        <div className="overflow-x-auto">
          <dl
            id={`responseTableRow${capitalize(lang)}`}
            className="flex overflow-x-auto border-b-2 border-t-2 border-grey-default"
          >
            <div className="flex flex-col" style={{ minWidth: "20rem", maxWidth: "20rem" }}>
              <dt className="flex items-center font-bold border-b border-grey-default py-4">
                {t("responseTemplate.responseNumber", { lng: lang })}
              </dt>
              <dd className="py-4">{responseID}</dd>
            </div>
            <div className="flex flex-col" style={{ minWidth: "20rem", maxWidth: "20rem" }}>
              <dt className="flex items-center font-bold border-b border-grey-default py-4">
                {t("responseTemplate.submissionDate", { lng: lang })}
              </dt>
              <dd className="py-4">
                {new Date(submissionDate).toLocaleString(`${lang + "-CA"}`, {
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                })}
              </dd>
            </div>
            <QuestionRows questionsAnswers={questionsAnswers} lang={lang} />
          </dl>
        </div>
      )}
    </>
  );
};
