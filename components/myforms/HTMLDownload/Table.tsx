import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes, Response } from "@lib/types";
import { capitalize } from "./ResponseSection";

export interface TableProps {
  isRowTable?: boolean;
  lang?: string;
  responseID: string;
  submissionDate: number;
  submissionID: string;
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
        <dt className="w-80 pt-2 pb-2 font-bold">{question}</dt>
        <dd className="max-w-[50rem] pt-2 pb-2">
          {response.map((subItem, subIndex) => (
            <p key={`${parentIndex}-${subIndex}`}>{subItem.toString()}</p>
          ))}
        </dd>
      </div>
    );
  } else {
    return (
      <div key={`col-${parentIndex}-${lang}`} className="flex border-b border-grey-default">
        <dt className="w-80 pt-2 pb-2 font-bold">{question}</dt>
        <dd className="max-w-[50rem] pt-2 pb-2">
          <p>{response.toString()}</p>
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
        style={{ minWidth: "20rem", maxWidth: "40rem" }}
      >
        <dt className="font-bold border-b border-grey-default pt-2 pb-2">{question}</dt>
        <dd className="pt-2 pb-2">
          {response.map((subItem, subIndex) => (
            <p key={`${parentIndex}-${subIndex}`}>{subItem.toString()}</p>
          ))}
        </dd>
      </div>
    );
  } else {
    return (
      <div
        key={`row-${parentIndex}-${lang}`}
        className="flex flex-col"
        style={{ minWidth: "20rem", maxWidth: "40rem" }}
      >
        <dt className="font-bold border-b border-grey-default pt-2 pb-2">{question}</dt>
        <dd className="pt-2 pb-2">
          <p>{response.toString()}</p>
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
            maxWidth: `${40 * dynamicRowResponse.length}rem`,
          }}
        >
          <dt className="pt-2 pb-2 font-bold border-b-2 border-grey-default">{question}</dt>
          <dd className="pt-2 pb-2">
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
          <dt className="w-full pt-2 pb-2 font-bold border-b-2 border-grey-default">{question}</dt>
          <dd className="w-full pt-2 pb-2">
            <dl>
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
    submissionID,
  } = props;

  return (
    <>
      {!isRowTable && (
        <dl
          id={`responseTableRow${capitalize(lang)}`}
          className="border-b-2 border-t-2 border-grey-default"
        >
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.responseNumber", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">{responseID}</dd>
          </div>
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">
              {new Date(submissionDate).toLocaleString(`${lang + "-CA"}`, {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })}
            </dd>
          </div>
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.submissionID", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">{submissionID}</dd>
          </div>

          <QuestionColumns questionsAnswers={questionsAnswers} lang={lang} />
        </dl>
      )}
      {/* Note: Inline styles used where Tailwind classes would fail, espcially custom e.g. min-w-[20rem] */}
      {isRowTable && (
        <dl className="flex overflow-x-auto border-b-2 border-t-2 border-grey-default">
          <div className="flex flex-col" style={{ minWidth: "20rem", maxWidth: "40rem" }}>
            <dt className="font-bold border-b border-grey-default pt-2 pb-2">
              {t("responseTemplate.responseNumber", { lng: lang })}
            </dt>
            <dd className="pt-2 pb-2">{responseID}</dd>
          </div>
          <div className="flex flex-col" style={{ minWidth: "20rem", maxWidth: "40rem" }}>
            <dt className="font-bold border-b border-grey-default pt-2 pb-2">
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="pt-2 pb-2">{submissionDate}</dd>
          </div>
          <QuestionRows questionsAnswers={questionsAnswers} lang={lang} />
        </dl>
      )}
    </>
  );
};
