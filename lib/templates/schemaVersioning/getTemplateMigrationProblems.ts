import { type FormProperties } from "@gcforms/types";
import { getTemplateSchemaVersion, migrateTemplate } from "./migrateTemplate";
import { CURRENT_TEMPLATE_VERSION } from "./migrations";
import { StrictElementMigrationError } from "./migrations/v0002_strictElementSchemas";

export type TemplateMigrationProblem = {
  path: string;
  name: string;
  message: string;
  fromVersion: number;
};

/** Check the same migration path as the editor, without changing the draft or logging on edits. */
export const getTemplateMigrationProblems = (
  template: FormProperties
): TemplateMigrationProblem[] => {
  if (getTemplateSchemaVersion(template) >= CURRENT_TEMPLATE_VERSION) return [];

  let problems: TemplateMigrationProblem[] = [];
  migrateTemplate(template, {
    logFailure: false,
    onFailure: (error, fromVersion) => {
      problems =
        error instanceof StrictElementMigrationError
          ? error.issues.map((issue) => ({ ...issue, fromVersion }))
          : [
              {
                path:
                  error instanceof Error
                    ? (error.message.match(
                        /elements(?:\[|\.)\d+(?:\])?(?:\.properties\.subElements\.\d+)*/
                      )?.[0] ?? "")
                    : "",
                name: "migration",
                message: error instanceof Error ? error.message : String(error),
                fromVersion,
              },
            ];
    },
  });
  return problems;
};
