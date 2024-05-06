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
  const { groups, getValues, setGroup, formRecord } = useGCFormsContext();
  const formValues = getValues();
  const headingRef = useRef(null);
  useFocusIt({ elRef: headingRef });

  // Remove the review and end groups so it won't show as a group in the review page
  const groupsTemp = { ...groups };
  delete groupsTemp["review"];
  delete groupsTemp["end"];

  function getElementNameById(id: string | number) {
    const element = formRecord.form.elements.find((item) => String(item.id) === String(id));
    return element ? element.properties?.[getLocalizedProperty("title", lang)] : t("unknown");
  }

  const questionsAndAnswers = Object.keys(groupsTemp).map((key) => {
    return {
      id: key,
      name: groupsTemp[key].name,
      elements: groupsTemp[key].elements.map((element) => {
        return {
          // @ts-expect-error todo
          [element]: formValues[element] || "-",
        };
      }),
    };
  });

  return (
    <>
      <h2 ref={headingRef}>{t("reviewForm")}</h2>

      {/* TODO fallback if no questionsAndAnswers? */}
      <div className="my-16">
        {questionsAndAnswers &&
          questionsAndAnswers.map((group) => {
            return (
              <div key={group.id} className="py-4 px-6 mb-10 border-2 border-slate-400 rounded-lg">
                <h3 className="text-slate-700 underline">{group.name}</h3>
                <div className="mb-10 ml-1">
                  <dl className="mt-10 mb-10">
                    {group.elements.map((element) => {
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
