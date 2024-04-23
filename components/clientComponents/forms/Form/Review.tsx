"use client";
import { useTranslation } from "@i18n/client";
import { FormRecord, Responses, TypeOmit } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import Link from "next/link";
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
  editCallback,
}: {
  children: ReactNode;
  formTitle?: string;
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption" | "bearerToken">;
  values: Responses;
  editCallback?: () => void;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation("review");

  const questionsAnswers =
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
      <h2>{t("title")}</h2>
      <p>{t("reviewForm")}</p>
      <div className="mt-10 mb-10">
        <dl>
          {questionsAnswers &&
            questionsAnswers.map((item: ReviewItem) => {
              return (
                <div key={item.id} className="mb-8">
                  <dt className="font-bold mb-2">
                    <span>{item.question}</span>
                    <span className="px-2">&#8226;</span>
                    <Link
                      href={`#${item.id}`}
                      onClick={() => {
                        editCallback && editCallback();
                      }}
                      className="font-normal"
                    >
                      {t("edit")}
                    </Link>
                  </dt>
                  <dl>
                    {Array.isArray(item.answer) && item.answer.length > 1
                      ? item.answer.join(", ")
                      : item.answer}
                  </dl>
                </div>
              );
            })}
        </dl>
      </div>
      <div className="flex">{children}</div>
    </div>
  );
}
