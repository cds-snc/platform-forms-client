"use client";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormRecord, TypeOmit } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import { useMemo, useRef } from "react";

type ReviewGroup = {
  id: string;
  name: string;
  title: string;
  elements: {
    [x: string]: string;
  }[];
};

type QuestionAnswer = {
  [x: string]: string;
};

export const Review = (): React.ReactElement => {
  const {
    t,
    i18n: { language: lang },
  } = useTranslation("review");
  const { groups, getValues, formRecord, getGroupHistory } = useGCFormsContext();
  const headingRef = useRef(null);

  useFocusIt({ elRef: headingRef });

  const questionsAndAnswers: ReviewGroup[] = useMemo(() => {
    function formatElementValue(elementName: string | null) {
      const value = formValues[elementName as keyof typeof formValues];
      if (Array.isArray(value)) {
        return (value as Array<string>).join(", ");
      }
      return value || "-";
    }
    const formValues = getValues();
    const reviewGroups = { ...groups };
    const groupHistory = getGroupHistory();
    return groupHistory
      .filter((key) => key !== "review") // Removed to avoid showing as a group
      .map((key) => {
        const titleLanguageKey = getLocalizedProperty("title", lang) as "titleEn" | "titleFr";
        const title = reviewGroups?.[key]?.[titleLanguageKey];
        return {
          id: key,
          name: reviewGroups[key].name,
          title,
          elements: reviewGroups[key].elements.map((element) => {
            const elementName = element as keyof typeof formValues;
            return {
              [element]: formatElementValue(elementName),
            };
          }),
        };
      });
  }, [groups, getValues, getGroupHistory, lang]);

  return (
    <>
      <h2 ref={headingRef}>{t("reviewForm")}</h2>
      <div className="my-16">
        {Array.isArray(questionsAndAnswers) &&
          questionsAndAnswers.map((group) => {
            const title = group.title || group.name; // group.name as fallback for groups like Start
            return (
              <div key={group.id} className="py-4 px-6 mb-10 border-2 border-slate-400 rounded-lg">
                <h3 className="text-slate-700">
                  <EditButton group={group} theme="link">
                    <>{title}</>
                  </EditButton>
                </h3>
                <div className="mb-10 ml-1">
                  <dl className="mt-10 mb-10">
                    {Array.isArray(group.elements) &&
                      group.elements.map((element) => (
                        <QuestionsAnswers
                          key={Object.keys(element)[0]}
                          element={element}
                          formRecord={formRecord}
                          lang={lang}
                        />
                      ))}
                  </dl>
                </div>
                <EditButton group={group} theme="secondary">
                  <>{t("edit")}</>
                </EditButton>
              </div>
            );
          })}
      </div>
    </>
  );
};

const QuestionsAnswers = ({
  element,
  formRecord,
  lang,
}: {
  element: QuestionAnswer;
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  lang: string;
}): React.ReactElement => {
  const { t } = useTranslation("review");
  function getElementNameById(id: string | number) {
    const element = formRecord.form.elements.find((item) => String(item.id) === String(id));
    return element ? element.properties?.[getLocalizedProperty("title", lang)] : t("unknown");
  }
  const question = getElementNameById(Object.keys(element)[0]) as string;
  const answer = Object.values(element)[0] as string;
  return (
    <div className="mb-8">
      <dt className="font-bold mb-2">{question}</dt>
      <dd>{answer}</dd>
    </div>
  );
};

const EditButton = ({
  group,
  theme,
  children,
}: {
  group: ReviewGroup;
  theme: Theme;
  children: React.ReactElement;
}): React.ReactElement => {
  const { setGroup, clearHistoryAfterId } = useGCFormsContext();
  return (
    <Button
      type="button"
      theme={theme}
      onClick={() => {
        setGroup(group.id);
        clearHistoryAfterId(group.id);
      }}
    >
      {children}
    </Button>
  );
};
