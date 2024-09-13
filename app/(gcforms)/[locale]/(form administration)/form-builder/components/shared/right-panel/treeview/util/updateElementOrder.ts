import { FormElement } from "@lib/types";

export function updateElementOrder(
  elements: FormElement[],
  position: number,
  nextPosition: number
): FormElement[] {
  const subElements = [...elements];
  const [removed] = subElements.splice(position, 1);
  subElements.splice(nextPosition, 0, removed);
  return subElements;
}
