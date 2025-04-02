import { SortOption } from "@gcforms/types";

type sortedChoice = {
  choice: string;
  index: number;
  innerId: string;
};

export const orderChoices = (
  id: string | undefined,
  choices: string[],
  sortOrder?: string | undefined
): sortedChoice[] => {
  const sortedChoices = choices
    .map((choice, i) => ({
      choice,
      index: i,
      innerId: `${id}.${i}`,
    }))
    .sort((a, b) => {
      if (sortOrder === SortOption.ASCENDING) {
        return a.choice.localeCompare(b.choice);
      }
      if (sortOrder === SortOption.DESCENDING) {
        return b.choice.localeCompare(a.choice);
      }
      return 0;
    });

  return sortedChoices;
};
