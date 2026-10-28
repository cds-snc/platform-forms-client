"use client";

import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTemplateMigrationProblems } from "@lib/store/hooks/useTemplateMigrationProblems";
import { describeMigrationProblem, type ProblemElement } from "./describeMigrationProblem";

const getElement = (elements: ProblemElement[], path: string): ProblemElement | undefined => {
  const index = path.match(/^elements(?:\[(\d+)\]|\.(\d+))/);
  if (!index) return undefined;
  let element: ProblemElement | undefined = elements[Number(index[1] ?? index[2])];
  for (const match of path.matchAll(/\.properties\.subElements(?:\[(\d+)\]|\.(\d+))/g)) {
    element = element?.properties?.subElements?.[Number(match[1] ?? match[2])];
  }
  return element;
};

export const Problems = () => {
  const { t, i18n } = useTranslation("form-builder");
  const problems = useTemplateMigrationProblems();
  const { form, id } = useTemplateStore((state) => ({ form: state.form, id: state.id }));
  const elements = form.elements as ProblemElement[];

  return (
    <div className="mr-6 max-w-4xl rounded-lg border bg-white p-6">
      <h1>{t("migrationProblems.title")}</h1>
      {problems.length === 0 ? (
        <p>{t("migrationProblems.resolved")}</p>
      ) : (
        <>
          <p>{t("migrationProblems.intro")}</p>
          <ol className="list-decimal space-y-5 pl-6">
            {problems.map((problem) => {
              const element = getElement(elements, problem.path);
              const title =
                (i18n.language === "fr"
                  ? element?.properties?.titleFr || element?.properties?.titleEn
                  : element?.properties?.titleEn || element?.properties?.titleFr) ||
                t("migrationProblems.untitled");
              return (
                <li key={`${problem.path}-${problem.name}-${problem.message}`}>
                  <strong>{element ? title : t("migrationProblems.form")}</strong>
                  <p className="mb-1">
                    {describeMigrationProblem(problem, element, i18n.language, t)}
                  </p>
                  <Link href={`/${i18n.language}/form-builder/${id}/edit#questions`}>
                    {t("migrationProblems.edit")}
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
};
