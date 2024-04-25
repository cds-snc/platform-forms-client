"use client";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { FormRecord, Responses, TypeOmit } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import Link from "next/link";
import { ReactNode, useMemo, useRef } from "react";

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

  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef });

  const questionsAnswers = useMemo(() => {
    return (
      formRecord?.form?.elements &&
      (formRecord.form.elements.map((element) => {
        const rawAnswer = values[element.id] as string | string[] | undefined | null;
        const answer = Array.isArray(rawAnswer)
          ? rawAnswer.length > 1
            ? rawAnswer.join(", ")
            : rawAnswer[0] || "-"
          : rawAnswer || "-";

        return {
          id: element.id,
          question: element.properties[getLocalizedProperty("title", language)],
          answer,
        };
      }) as ReviewItem[])
    );
  }, [formRecord, values, language]);

  return (
    <div>
      {formTitle && <h1>{formTitle}</h1>}
      <h2 ref={headingRef}>{t("title")}</h2>
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
                  <dl>{item.answer}</dl>
                </div>
              );
            })}
        </dl>
      </div>
      {children}
    </div>
  );
}
