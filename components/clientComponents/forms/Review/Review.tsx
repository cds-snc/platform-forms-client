"use client";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { useFocusIt } from "@lib/hooks/useFocusIt";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { getLocalizedProperty } from "@lib/utils";
import { useRef } from "react";

export const Review = (): React.ReactElement => {
  const {
    t,
    i18n: { language: lang },
  } = useTranslation("review");
  const { groups, getValues, setGroup, formRecord, clearHistoryAfterId, getGroupHistory } =
    useGCFormsContext();
  const formValues = getValues();
  const headingRef = useRef(null);

  function getElementNameById(id: string | number) {
    const element = formRecord.form.elements.find((item) => String(item.id) === String(id));
    return element ? element.properties?.[getLocalizedProperty("title", lang)] : t("unknown");
  }

  function formatElementValue(elementName: string | null) {
    const value = formValues[elementName as keyof typeof formValues];
    if (Array.isArray(value)) {
      return (value as Array<string>).join(", ");
    }
    return value || "-";
  }

  useFocusIt({ elRef: headingRef });

  const reviewGroups = { ...groups };
  const questionsAndAnswers = getGroupHistory()
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

  return (
    <>
      <h2 ref={headingRef}>{t("reviewForm")}</h2>
      <div className="my-16">
        {Array.isArray(questionsAndAnswers) &&
          questionsAndAnswers.map((group) => {
            return (
              <div key={group.id} className="py-4 px-6 mb-10 border-2 border-slate-400 rounded-lg">
                <h3 className="text-slate-700">
                  <Button
                    theme="link"
                    type="button"
                    onClick={() => {
                      setGroup(group.id);
                      clearHistoryAfterId(group.id);
                    }}
                  >
                    {/* group.name fallback is needed for sections without titles like Start */}
                    {group.title || group.name}
                  </Button>
                </h3>
                <div className="mb-10 ml-1">
                  <dl className="mt-10 mb-10">
                    {Array.isArray(group.elements) &&
                      group.elements.map((element) => {
                        const question = getElementNameById(Object.keys(element)[0]) as string;
                        const answer = Object.values(element)[0] as string;
                        return (
                          <div key={Object.keys(element)[0]} className="mb-8">
                            <dt className="font-bold mb-2">{question}</dt>
                            <dd>{answer}</dd>
                          </div>
                        );
                      })}
                  </dl>
                </div>
                <Button
                  type="button"
                  theme="secondary"
                  onClick={() => {
                    setGroup(group.id);
                    clearHistoryAfterId(group.id);
                  }}
                >
                  {t("edit")}
                </Button>
              </div>
            );
          })}
      </div>
    </>
  );
};
