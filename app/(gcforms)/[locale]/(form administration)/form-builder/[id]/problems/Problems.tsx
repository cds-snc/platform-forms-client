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

const findElement = (
  elements: ProblemElement[],
  id: string,
  parent?: ProblemElement
): { element: ProblemElement; parent: ProblemElement } | undefined => {
  for (const element of elements) {
    if (String(element.id) === id) return { element, parent: parent ?? element };
    const match = findElement(element.properties?.subElements ?? [], id, parent ?? element);
    if (match) return match;
  }
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
              const element = getProblemElement(elements, problem.path);
              const parent = getProblemElement(elements, problem.path.split(".properties")[0]);
              const ruleIndex = problem.path.match(
                /\.conditionalRules(?:\[(\d+)\]|\.(\d+))\.choiceId$/
              );
              const choiceId = ruleIndex
                ? element?.properties?.conditionalRules?.[Number(ruleIndex[1] ?? ruleIndex[2])]
                    ?.choiceId
                : undefined;
              const sourceId =
                typeof choiceId === "string" ? choiceId.match(/^(\d+)\./)?.[1] : undefined;
              const source = sourceId ? findElement(elements, sourceId) : undefined;
              const target = source?.element ?? element;
              const targetParent = source?.parent ?? parent;
              const groupId = Object.entries(form.groups ?? {}).find(([, group]) =>
                group.elements.includes(String(targetParent?.id))
              )?.[0];
              const editHref = `/${i18n.language}/form-builder/${id}/edit`;
              const href =
                target?.id !== undefined && groupId
                  ? `${editHref}?group=${encodeURIComponent(groupId)}#element-${target.id}`
                  : editHref;
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
                  <Link href={href}>{t("migrationProblems.edit")}</Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
};
