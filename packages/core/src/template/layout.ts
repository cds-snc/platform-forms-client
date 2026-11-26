import { type FormElement, type FormProperties, type Group, type GroupsType } from "@gcforms/types";

export interface FormElementHash {
  [key: string]: FormElement;
}

const getFormElementCollection = (form: FormProperties): FormElementHash => {
  const elementCollection: FormElementHash = {};
  if (form.elements === undefined) return elementCollection;

  for (const element of form.elements) {
    elementCollection[element.id] = element;
  }

  return elementCollection;
};

const getElementsByIds = (
  elementCollection: FormElementHash,
  elementIds?: Group["elements"]
): FormElement[] => {
  if (!elementIds) return [];

  return elementIds.map((elementId) => elementCollection[elementId]);
};

export const sortGroup = ({ form, group }: { form: FormProperties; group: Group }) => {
  const elementCollection = getFormElementCollection(form);
  return getElementsByIds(elementCollection, group.elements);
};

export const getLayoutFromGroups = (form: FormProperties, groups: GroupsType): number[] => {
  const layout: number[] = [];
  const elementCollection = getFormElementCollection(form);

  for (const key in groups) {
    if (Object.prototype.hasOwnProperty.call(groups, key)) {
      const group = groups[key];
      if (group.elements === undefined) return [];
      layout.push(...getElementsByIds(elementCollection, group.elements).map(({ id }) => id));
    }
  }

  return layout;
};

export const sortByLayout = ({
  layout,
  elements,
}: {
  layout: number[];
  elements: FormElement[];
}) => {
  return [...elements].sort((a, b) => layout.indexOf(a.id) - layout.indexOf(b.id));
};

export const sortByGroups = ({
  form,
  elements,
}: {
  form: FormProperties;
  elements: FormElement[];
}) => {
  if (!form.groups) {
    return sortByLayout({ layout: form.layout, elements });
  }

  const layout = getLayoutFromGroups(form, form.groups);
  return sortByLayout({ layout, elements });
};
