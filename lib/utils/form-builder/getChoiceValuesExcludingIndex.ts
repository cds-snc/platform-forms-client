import { type Language } from "@lib/types/form-builder-types";

type Choice = Partial<Record<Language, string>> | undefined;

/** Non-empty choice labels in `lang`, excluding the choice at `index`. */
export const getChoiceValuesExcludingIndex = (
  choices: Choice[] | undefined,
  index: number,
  lang: Language
): string[] =>
  (choices ?? []).flatMap((choice, choiceIndex) => {
    const value = choice?.[lang];
    return choiceIndex !== index && value ? [value] : [];
  });
