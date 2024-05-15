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

  useFocusIt({ elRef: headingRef });

  const reviewGroups = { ...groups };
  const questionsAndAnswers = getGroupHistory()
    .filter((key) => key !== "review") // Removed to avoid showing as a group
    .map((key) => {
      return {
        id: key,
        name: reviewGroups[key].name,
        elements: reviewGroups[key].elements.map((element) => {
          const elementName = element as keyof typeof formValues;
          return {
            [element]: formValues[elementName] || "-",
          };
        }),
      };
    });

  function getElementNameById(id: string | number) {
    const element = formRecord.form.elements.find((item) => String(item.id) === String(id));
    return element ? element.properties?.[getLocalizedProperty("title", lang)] : t("unknown");
  }

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
                    {group.name}
                  </Button>
                </h3>
                <div className="mb-10 ml-1">
                  <dl className="mt-10 mb-10">
                    {Array.isArray(group.elements) &&
                      group.elements.map((element) => {
                        return (
                          <div key={Object.keys(element)[0]} className="mb-8">
                            <dt className="font-bold mb-2">
                              <>{getElementNameById(Object.keys(element)[0])}</>
                            </dt>
                            <dd>{Object.values(element)[0]}</dd>
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
