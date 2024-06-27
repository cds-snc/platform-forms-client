import { useMemo, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Theme } from "@clientComponents/globals/Buttons/themes";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { FormRecord, TypeOmit } from "@lib/types";
import { Language } from "@lib/types/form-builder-types";
import { getLocalizedProperty } from "@lib/utils";

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

const QuestionsAnswers = ({
  group,
  formRecord,
  lang,
}: {
  group: ReviewGroup;
  formRecord: TypeOmit<FormRecord, "name" | "deliveryOption">;
  lang: string;
}): React.ReactElement => {
  const { t } = useTranslation("review");
  function getElementNameById(id: string | number) {
    const element = formRecord.form.elements.find((item) => String(item.id) === String(id));
    return element ? element.properties?.[getLocalizedProperty("title", lang)] : t("unknown");
  }
  function getQuestionAndAnswer(element: QuestionAnswer) {
    const question = getElementNameById(Object.keys(element)[0]) as string;
    const answer = Object.values(element)[0] as string;
    return { question, answer };
  }
  return (
    <dl className="my-10">
      {Array.isArray(group.elements) &&
        group.elements.map((element) => {
          const { question, answer } = getQuestionAndAnswer(element);
          return (
            <div key={Object.keys(element)[0]} className="mb-8">
              <dt className="font-bold mb-2">{question}</dt>
              <dd>{answer}</dd>
            </div>
          );
        })}
    </dl>
  );
};

const EditButton = ({
  group,
  theme,
  children,
}: {
  group: ReviewGroup;
  theme: Theme;
  children: React.ReactElement | string;
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

export const Review = ({ language }: { language: Language }): React.ReactElement => {
  const { t } = useTranslation(["review", "common"]);
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle } = useGCFormsContext();
  const headingRef = useRef(null);

  useFocusIt({ elRef: headingRef });

  const questionsAndAnswers: ReviewGroup[] = useMemo(() => {
    function formatElementValue(elementName: string | null) {
      const value = formValues[elementName as keyof typeof formValues];
      if (Array.isArray(value)) {
        return (value as Array<string>).join(", ") || "-";
      }
      return value || "-";
    }
    const formValues = getValues();
    const reviewGroups = { ...groups };
    const groupHistory = getGroupHistory();
    return groupHistory
      .filter((key) => key !== "review") // Removed to avoid showing as a group
      .map((key) => {
        const elements = reviewGroups[key].elements.map((element) => {
          const elementName = element as keyof typeof formValues;
          return {
            [element]: formatElementValue(elementName),
          };
        });
        return {
          id: key,
          name: reviewGroups[key].name,
          title: getGroupTitle(key, language),
          elements,
        };
      });
  }, [groups, getValues, getGroupHistory, getGroupTitle, language]);

  return (
    <>
      <h2 ref={headingRef}>{t("reviewForm", { lng: language })}</h2>
      <div className="my-16">
        {Array.isArray(questionsAndAnswers) &&
          questionsAndAnswers.map((group) => {
            const title = group.title ? group.title : t("start", { ns: "common", lng: language });
            return (
              <div key={group.id} className="mb-10 rounded-lg border-2 border-slate-400 px-6 py-4">
                <h3 className="text-slate-700">
                  <EditButton group={group} theme="link">
                    {title}
                  </EditButton>
                </h3>
                <div className="mb-10 ml-1">
                  <QuestionsAnswers group={group} formRecord={formRecord} lang={language} />
                </div>
                <EditButton group={group} theme="secondary">
                  {t("edit", { lng: language })}
                </EditButton>
              </div>
            );
          })}
      </div>
    </>
  );
};
