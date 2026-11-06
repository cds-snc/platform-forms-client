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
import { describeTemplateProblem } from "./describeTemplateProblem";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useRefsContext } from "./RefsContext";
import { useTemplateValidationProblems } from "@lib/store/hooks/useTemplateValidationProblems";
import { type TemplateValidationProblem } from "@lib/utils/form-builder/validate";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";

const TemplateProblemList = ({
  problems,
  editable,
}: {
  problems: TemplateValidationProblem[];
  editable: boolean;
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const elements = useTemplateStore((state) => state.form.elements);
  const id = useTemplateStore((state) => state.id);
  const { setId, findParentGroup } = useGroupStore((state) => ({
    setId: state.setId,
    findParentGroup: state.findParentGroup,
  }));
  const { refs } = useRefsContext();

  return (
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
            {editable && element && parentElement ? (
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
            ) : !editable ? (
              <Link
                href={`/${i18n.language}/form-builder/${id || "0000"}/edit#template-validation-errors`}
              >
                {element ? title : t("migrationProblems.form")}
              </Link>
            ) : (
              <strong>{t("migrationProblems.form")}</strong>
            )}
            <p className="mb-1">{describeTemplateProblem(problem, element, i18n.language, t)}</p>
            {editable && !element && <Link href="#questions">{t("migrationProblems.edit")}</Link>}
          </li>
        );
      })}
    </ol>
  );
};

const TemplateProblemsSummary = ({
  problems,
  editable,
  blocking = false,
}: {
  problems: TemplateValidationProblem[];
  editable: boolean;
  blocking?: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const translationKey = blocking ? "validationProblems" : "migrationProblems";

  return (
    <div
      id={blocking ? "template-validation-errors" : "problems"}
      role={blocking ? "alert" : undefined}
      tabIndex={blocking ? -1 : undefined}
      className="mb-5 flex max-w-[800px] gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
    >
      <WarningIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 fill-amber-700" />
      <div>
        <p className="mb-1 font-bold">{t(`${translationKey}.count`, { count: problems.length })}</p>
        <p className="mb-1">{t(`${translationKey}.notice`)}</p>
        <InfoDetails
          summary={t(`${translationKey}.show`)}
          expandedSummary={t(`${translationKey}.hide`)}
        >
          <p className="mt-3">{t(`${translationKey}.intro`)}</p>
          <TemplateProblemList problems={problems} editable={editable} />
        </InfoDetails>
      </div>
    </div>
  );
};

export const TemplateValidationErrors = ({ editable = false }: { editable?: boolean }) => {
  const { showValidationErrors } = useTemplateContext();
  const problems = useTemplateValidationProblems();
  const migrationProblems = useTemplateMigrationProblems();
  useMigrationProblemFeedback([...migrationProblems, ...problems]);

  if (!showValidationErrors || problems.length === 0) return null;

  return <TemplateProblemsSummary problems={problems} editable={editable} blocking />;
};

export const MigrationProblemsNotice = () => {
  const problems = useTemplateMigrationProblems();

  if (problems.length === 0) return null;

  return <TemplateProblemsSummary problems={problems} editable />;
};
