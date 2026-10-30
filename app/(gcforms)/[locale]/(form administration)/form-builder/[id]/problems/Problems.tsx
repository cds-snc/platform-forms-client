"use client";

import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTemplateMigrationProblems } from "@lib/store/hooks/useTemplateMigrationProblems";
import {
  getLocalizedLabel,
  getProblemElement,
  type ProblemElement,
} from "@lib/templates/schemaVersioning/migrationProblemHelpers";
import { describeMigrationProblem } from "./describeMigrationProblem";

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
              const element = getProblemElement(elements, problem.path);
              const title =
                getLocalizedLabel(
                  { en: element?.properties?.titleEn, fr: element?.properties?.titleFr },
                  i18n.language
                ) || t("migrationProblems.untitled");
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
