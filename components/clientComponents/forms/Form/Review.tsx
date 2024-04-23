"use client";
import { useTranslation } from "@i18n/client";
import { FormRecord, Responses, TypeOmit } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import { ReactNode } from "react";

interface ReviewItem {
  id: number;
  question: string;
  answer: string | string[] | undefined | null;
}

export default function Review({
  children,
  formTitle,
  formRecord,
  values,
}: {
  children: ReactNode;
  formTitle?: string;
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption" | "bearerToken">;
  values: Responses;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation("review");

  const questionsAnswer =
    formRecord?.form?.elements &&
    (formRecord.form.elements.map((element) => {
      return {
        id: element.id,
        question: element.properties[getLocalizedProperty("title", language)],
        answer: values[element.id] || "-",
      };
    }) as ReviewItem[]);

  return (
    <div>
      {formTitle && <h1>{formTitle}</h1>}
      <h2>{t("review")}</h2>
      <div>
        {JSON.stringify(questionsAnswer)}
        {questionsAnswer.map((item: ReviewItem) => {
          return (
            <div key={item.id}>
              {item.question}
              <br />
              {Array.isArray(item.answer) && item.answer.length > 1
                ? item.answer.join(", ")
                : item.answer}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
