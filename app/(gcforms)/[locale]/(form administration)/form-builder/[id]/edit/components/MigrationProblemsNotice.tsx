"use client";

import Link from "next/link";
import { flushSync } from "react-dom";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { WarningIcon } from "@serverComponents/icons";
import { useTemplateMigrationProblems } from "@lib/store/hooks/useTemplateMigrationProblems";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useMigrationProblemFeedback } from "@lib/store/hooks/useMigrationProblemFeedback";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";
import {
  getLocalizedLabel,
  getProblemElement,
} from "@lib/templates/schemaVersioning/migrationProblemHelpers";
import { describeMigrationProblem } from "./describeMigrationProblem";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useRefsContext } from "./RefsContext";

export const MigrationProblemsNotice = () => {
  const { t, i18n } = useTranslation("form-builder");
  const problems = useTemplateMigrationProblems();
  useMigrationProblemFeedback(problems);
  const elements = useTemplateStore((state) => state.form.elements);
  const { setId, findParentGroup } = useGroupStore((state) => ({
    setId: state.setId,
    findParentGroup: state.findParentGroup,
  }));
  const { refs } = useRefsContext();

  if (problems.length === 0) return null;

  return (
    <div
      id="problems"
      className="mb-5 flex max-w-[800px] gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
    >
      <WarningIcon className="mt-0.5 size-6 shrink-0 fill-amber-700" />
      <div>
        <p className="mb-1 font-bold">{t("migrationProblems.count", { count: problems.length })}</p>
        <p className="mb-1">{t("migrationProblems.notice")}</p>
        <InfoDetails
          summary={t("migrationProblems.show")}
          expandedSummary={t("migrationProblems.hide")}
        >
          <p className="mt-3">{t("migrationProblems.intro")}</p>
          <ol className="list-decimal space-y-5 pl-6">
            {problems.map((problem) => {
              const element = getProblemElement(elements, problem.path);
              const parentElement = getProblemElement(
                elements,
                problem.path.split(".properties.subElements")[0]
              );
              const title =
                getLocalizedLabel(
                  { en: element?.properties?.titleEn, fr: element?.properties?.titleFr },
                  i18n.language
                ) || t("migrationProblems.untitled");
              return (
                <li key={`${problem.path}-${problem.name}-${problem.message}`}>
                  {element && parentElement ? (
                    <Button
                      theme="link"
                      onClick={() => {
                        const parentGroup = findParentGroup(String(parentElement.id));
                        // Render the destination page before focusing its element.
                        flushSync(() => setId(parentGroup?.index.toString() || "start"));
                        const panel =
                          document.querySelector<HTMLElement>(`[data-id="${element.id}"]`) ??
                          document.getElementById(`element-${element.id}`);
                        const input =
                          element.type === "richText"
                            ? panel?.querySelector<HTMLElement>("[id^='editor-']")
                            : refs?.current?.[element.id];
                        input?.focus();
                        (panel ?? input)?.scrollIntoView({ block: "center" });
                      }}
                    >
                      {title}
                    </Button>
                  ) : (
                    <strong>{t("migrationProblems.form")}</strong>
                  )}
                  <p className="mb-1">
                    {describeMigrationProblem(problem, element, i18n.language, t)}
                  </p>
                  {!element && <Link href="#questions">{t("migrationProblems.edit")}</Link>}
                </li>
              );
            })}
          </ol>
        </InfoDetails>
      </div>
    </div>
  );
};
